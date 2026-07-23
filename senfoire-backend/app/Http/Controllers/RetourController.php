<?php

namespace App\Http\Controllers;

use App\Models\Retour;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\Notification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RetourController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'commande_id' => 'required|exists:commandes,id',
            'produit_id' => 'required|exists:produits,id',
            'quantite' => 'required|integer|min:1',
            'motif' => 'required|string|in:produit_defectueux,mauvais_article,pas_satisfait,autre',
            'description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $commande = Commande::find($request->commande_id);

        if ($commande->client_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }

        if (!in_array($commande->statut, ['livree'])) {
            return response()->json(['success' => false, 'message' => 'Vous ne pouvez retourner que des commandes livrées.'], 400);
        }

        $retour = Retour::create([
            'commande_id' => $request->commande_id,
            'client_id' => $user->id,
            'produit_id' => $request->produit_id,
            'quantite' => $request->quantite,
            'motif' => $request->motif,
            'description' => $request->description,
            'statut' => 'en_attente',
        ]);

        // Notify admin
        $admins = User::where('role', 'admin')->pluck('id')->toArray();
        foreach ($admins as $adminId) {
            NotificationService::sendPushNotification(
                $adminId,
                'Nouvelle demande de retour',
                "Commande #{$commande->id} - Un client demande un retour.",
                ['type' => 'retour', 'commande_id' => $commande->id]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Demande de retour enregistrée.',
            'data' => $retour,
        ], 201);
    }

    public function mesRetours(Request $request)
    {
        $retours = Retour::with(['commande', 'produit'])
            ->where('client_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $retours]);
    }

    public function adminIndex(Request $request)
    {
        $retours = Retour::with(['commande.client', 'produit', 'client'])
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $retours]);
    }

    public function adminDecision(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'statut' => 'required|string|in:approuve,refuse,rembourse',
            'decision_admin' => 'nullable|string',
            'montant_remboursement' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $retour = Retour::find($id);
        if (!$retour) {
            return response()->json(['success' => false, 'message' => 'Retour introuvable.'], 404);
        }

        $retour->update([
            'statut' => $request->statut,
            'decision_admin' => $request->decision_admin,
            'montant_remboursement' => $request->montant_remboursement,
        ]);

        // Notify client
        $msg = match ($request->statut) {
            'approuve' => "Votre retour pour la commande #{$retour->commande_id} a été approuvé.",
            'refuse' => "Votre retour pour la commande #{$retour->commande_id} a été refusé. " . ($request->decision_admin ?? ''),
            'rembourse' => "Un remboursement de " . number_format($request->montant_remboursement ?? 0, 0, ',', ' ') . " FCFA a été effectué pour votre retour.",
            default => 'Statut de votre demande de retour mis à jour.',
        };

        NotificationService::sendPushNotification(
            $retour->client_id,
            'Retour mis à jour',
            $msg,
            ['type' => 'retour', 'retour_id' => $retour->id]
        );

        return response()->json(['success' => true, 'message' => 'Décision enregistrée.', 'data' => $retour]);
    }
}
