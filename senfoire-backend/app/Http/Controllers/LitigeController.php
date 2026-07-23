<?php
// Litige feature removed - no longer used

namespace App\Http\Controllers;

use App\Models\Litige;
use App\Models\Commande;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LitigeController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if ($user->role === 'admin') {
            $litiges = Litige::with(['client:id,nom,prenom', 'vendeur:id,nom,prenom', 'commande:id,montant_total'])
                ->latest()->get();
        } elseif ($user->role === 'client') {
            $litiges = Litige::with(['commande:id,montant_total'])
                ->where('client_id', $user->id)->latest()->get();
        } else {
            $litiges = Litige::with(['client:id,nom,prenom', 'commande:id,montant_total'])
                ->where('vendeur_id', $user->id)->latest()->get();
        }

        return response()->json(['success' => true, 'data' => $litiges]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'commande_id' => 'required|exists:commandes,id',
            'type' => 'required|in:produit_non_conforme,commande_non_livree,remboursement,autre',
            'description' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $commande = Commande::with('lignes.produit.stand.vendeur')->findOrFail($request->commande_id);

        if ($commande->client_id !== $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'Cette commande ne vous appartient pas.'], 403);
        }

        $existant = Litige::where('commande_id', $request->commande_id)
            ->where('client_id', $request->user()->id)
            ->whereIn('statut', ['ouvert', 'en_cours'])
            ->first();

        if ($existant) {
            return response()->json(['success' => false, 'message' => 'Un litige est déjà en cours pour cette commande.'], 400);
        }

        $vendeur = $commande->lignes->first()?->produit?->stand?->vendeur;

        $litige = Litige::create([
            'commande_id' => $request->commande_id,
            'client_id' => $request->user()->id,
            'vendeur_id' => $vendeur?->id,
            'type' => $request->type,
            'description' => $request->description,
        ]);

        Notification::create([
            'user_id' => $vendeur?->id,
            'type' => 'nouveau_litige',
            'message' => "Un litige a été ouvert pour la commande #{$commande->id}",
        ]);

        return response()->json(['success' => true, 'data' => $litige], 201);
    }

    public function update(Request $request, $id)
    {
        $litige = Litige::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'statut' => 'required|in:ouvert,en_cours,resolu,rejete',
            'resolution' => 'nullable|string',
            'decision' => 'nullable|in:remboursement_total,remboursement_partiel,aucun',
            'montant_rembourse' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $litige->update([
            'statut' => $request->statut,
            'resolution' => $request->resolution,
            'decision' => $request->decision,
            'montant_rembourse' => $request->montant_rembourse ?? 0,
            'resolu_par' => $request->user()->id,
            'resolu_le' => in_array($request->statut, ['resolu', 'rejete']) ? now() : $litige->resolu_le,
        ]);

        if ($request->statut === 'resolu') {
            Notification::create([
                'user_id' => $litige->client_id,
                'type' => 'litige_resolu',
                'message' => "Votre litige #{$litige->id} a été résolu. Décision : {$request->decision}."
                    . ($request->montant_rembourse ? " Montant remboursé : " . number_format($request->montant_rembourse, 0, ',', ' ') . " FCFA." : ''),
            ]);
        }

        return response()->json(['success' => true, 'data' => $litige]);
    }
}
