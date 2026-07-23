<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\LigneDeCommande;
use App\Models\Produit;
use App\Models\Stand;
use App\Models\Avi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendeurStatsController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $stand = $user->stand;

        if (!$stand) {
            return response()->json(['success' => false, 'message' => 'Aucun stand trouvé.'], 404);
        }

        $produitIds = Produit::where('stand_id', $stand->id)->pluck('id');

        // Total CA (chiffre d'affaires)
        $ca = LigneDeCommande::whereIn('produit_id', $produitIds)
            ->join('commandes', 'ligne_de_commandes.commande_id', '=', 'commandes.id')
            ->where('commandes.statut', '!=', 'en_attente')
            ->sum('ligne_de_commandes.quantite'); // total articles vendus

        $chiffreAffaires = LigneDeCommande::whereIn('produit_id', $produitIds)
            ->join('commandes', 'ligne_de_commandes.commande_id', '=', 'commandes.id')
            ->join('produits', 'ligne_de_commandes.produit_id', '=', 'produits.id')
            ->where('commandes.statut', '!=', 'en_attente')
            ->selectRaw('SUM(produits.prix * ligne_de_commandes.quantite) as total')
            ->value('total') ?? 0;

        // Nombre de commandes
        $nbCommandes = LigneDeCommande::whereIn('produit_id', $produitIds)
            ->join('commandes', 'ligne_de_commandes.commande_id', '=', 'commandes.id')
            ->distinct('commandes.id')
            ->count('commandes.id');

        // Produits les plus vendus
        $produitsVendus = LigneDeCommande::whereIn('produit_id', $produitIds)
            ->join('produits', 'ligne_de_commandes.produit_id', '=', 'produits.id')
            ->select('produits.nom', DB::raw('SUM(ligne_de_commandes.quantite) as total_vendu'))
            ->groupBy('produits.id', 'produits.nom')
            ->orderByDesc('total_vendu')
            ->limit(5)
            ->get();

        // Note moyenne du stand
        $noteMoyenne = Avi::where('avisable_id', $stand->id)
            ->where('avisable_type', Stand::class)
            ->avg('note') ?? 0;

        // Nombre total d'avis
        $nbAvis = Avi::where('avisable_id', $stand->id)
            ->where('avisable_type', Stand::class)
            ->count();

        // Revenus du mois
        $revenuMois = LigneDeCommande::whereIn('produit_id', $produitIds)
            ->join('commandes', 'ligne_de_commandes.commande_id', '=', 'commandes.id')
            ->join('produits', 'ligne_de_commandes.produit_id', '=', 'produits.id')
            ->where('commandes.statut', '!=', 'en_attente')
            ->whereMonth('commandes.created_at', now()->month)
            ->whereYear('commandes.created_at', now()->year)
            ->selectRaw('SUM(produits.prix * ligne_de_commandes.quantite) as total')
            ->value('total') ?? 0;

        // Commandes du mois
        $commandesMois = LigneDeCommande::whereIn('produit_id', $produitIds)
            ->join('commandes', 'ligne_de_commandes.commande_id', '=', 'commandes.id')
            ->whereMonth('commandes.created_at', now()->month)
            ->whereYear('commandes.created_at', now()->year)
            ->distinct('commandes.id')
            ->count('commandes.id');

        // Nombre de produits actifs
        $nbProduits = Produit::where('stand_id', $stand->id)->count();

        // Commandes récentes
        $commandesRecentes = LigneDeCommande::whereIn('produit_id', $produitIds)
            ->join('commandes', 'ligne_de_commandes.commande_id', '=', 'commandes.id')
            ->join('users', 'commandes.client_id', '=', 'users.id')
            ->select('commandes.id', 'commandes.montant_total', 'commandes.statut', 'commandes.created_at', 'users.prenom', 'users.nom')
            ->orderByDesc('commandes.created_at')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'chiffre_affaires_total' => round($chiffreAffaires, 2),
                'chiffre_affaires_mois' => round($revenuMois, 2),
                'nb_commandes_total' => $nbCommandes,
                'nb_commandes_mois' => $commandesMois,
                'nb_produits' => $nbProduits,
                'note_moyenne' => round($noteMoyenne, 1),
                'nb_avis' => $nbAvis,
                'produits_vendus' => $produitsVendus,
                'commandes_recentes' => $commandesRecentes,
            ],
        ]);
    }
}
