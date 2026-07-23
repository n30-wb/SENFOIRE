<?php
namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\Livraison;
use App\Models\Paiement;
use App\Models\Notification;
use App\Models\User;
use App\Events\OrderStatusEvent;
use App\Services\FideliteService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class CaissierController extends Controller
{
    public function commandesEnAttente(Request $request)
    {
        $commandes = Commande::with(['client', 'lignes.produit.stand.vendeur', 'paiement', 'promoCode'])
            ->where('statut', 'en_attente')
            ->where('valide_caissier', false)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $commandes]);
    }

    public function validerPaiement(Request $request, $id)
    {
        $commande = Commande::with(['lignes.produit.stand'])->find($id);
        if (!$commande) {
            return response()->json(['success' => false, 'message' => 'Commande introuvable.'], 404);
        }
        if ($commande->valide_caissier) {
            return response()->json(['success' => false, 'message' => 'Paiement déjà validé.'], 400);
        }

        $commande->update([
            'valide_caissier' => true,
            'statut' => 'payee',
        ]);

        if ($commande->paiement) {
            $commande->paiement->update(['statut' => 'succes']);
        }

        $livraison = Livraison::create([
            'commande_id' => $commande->id,
            'statut' => 'disponible',
        ]);

        $calculService = new \App\Services\CalculLivraison();
        $result = $calculService->calculerPrixLivraison($commande);
        $livraison->update([
            'prix_livraison' => $result['prix_livraison'] ?? 0,
            'distance_km' => $result['distance_km'] ?? 0,
        ]);

        $commande->update([
            'prix_livraison' => $result['prix_livraison'] ?? 0,
            'distance_km' => $result['distance_km'] ?? 0,
        ]);

        Notification::create([
            'user_id' => $commande->client_id,
            'type' => 'commande_validee',
            'message' => 'Votre commande #' . $commande->id . ' a été confirmée. Nous recherchons un livreur.',
        ]);

        $livreurs = User::where('role', 'livreur')->get();
        foreach ($livreurs as $livreur) {
            Notification::create([
                'user_id' => $livreur->id,
                'type' => 'nouvelle_livraison',
                'message' => 'Une nouvelle livraison est disponible (Commande #' . $commande->id . ').',
            ]);
        }

        // Broadcast order status change
        broadcast(new OrderStatusEvent($commande, 'payee'));

        // Award fidelity points to client
        $montantApresReduction = $commande->montant_total_apres_reduction ?? $commande->montant_total;
        FideliteService::awardPoints($commande->client_id, $montantApresReduction, $commande->id);

        return response()->json(['success' => true, 'message' => 'Paiement validé. Livreurs notifiés.']);
    }

    public function historique(Request $request)
    {
        $commandes = Commande::with(['client', 'lignes.produit.stand'])
            ->where('valide_caissier', true)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $commandes]);
    }
}
