<?php

namespace App\Http\Controllers;

use App\Models\CommandeRecurrente;
use App\Models\CommandeRecurrenteProduit;
use App\Models\Commande;
use App\Models\LigneDeCommande;
use App\Models\Paiement;
use App\Models\Produit;
use App\Models\User;
use App\Models\Notification;
use App\Services\CalculLivraison;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CommandeRecurrenteController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'frequence' => 'required|string|in:hebdomadaire,bimensuel,mensuel',
            'produits' => 'required|array|min:1',
            'produits.*.produit_id' => 'required|exists:produits,id',
            'produits.*.quantite' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        $prochaineCommande = match ($request->frequence) {
            'hebdomadaire' => now()->addWeek(),
            'bimensuel' => now()->addDays(15),
            'mensuel' => now()->addMonth(),
            default => now()->addMonth(),
        };

        DB::beginTransaction();
        try {
            $commandeRecurrente = CommandeRecurrente::create([
                'client_id' => $user->id,
                'frequence' => $request->frequence,
                'prochaine_commande' => $prochaineCommande->toDateString(),
                'active' => true,
            ]);

            foreach ($request->produits as $item) {
                CommandeRecurrenteProduit::create([
                    'commande_recurrente_id' => $commandeRecurrente->id,
                    'produit_id' => $item['produit_id'],
                    'quantite' => $item['quantite'],
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Commande récurrente créée avec succès.',
                'data' => $commandeRecurrente->load('produits'),
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Erreur lors de la création.'], 500);
        }
    }

    public function index(Request $request)
    {
        $commandes = CommandeRecurrente::with('produits')
            ->where('client_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $commandes]);
    }

    public function toggle(Request $request, $id)
    {
        $commande = CommandeRecurrente::where('id', $id)->where('client_id', $request->user()->id)->first();
        if (!$commande) {
            return response()->json(['success' => false, 'message' => 'Introuvable.'], 404);
        }
        $commande->update(['active' => !$commande->active]);
        return response()->json([
            'success' => true,
            'message' => $commande->active ? 'Commande réactive.' : 'Commande suspendue.',
            'data' => $commande,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $commande = CommandeRecurrente::where('id', $id)->where('client_id', $request->user()->id)->first();
        if (!$commande) {
            return response()->json(['success' => false, 'message' => 'Introuvable.'], 404);
        }
        $commande->delete();
        return response()->json(['success' => true, 'message' => 'Commande récurrente supprimée.']);
    }
}
