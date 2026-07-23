<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use App\Models\LigneDeCommande;
use App\Models\Produit;
use App\Models\Livraison;
use App\Models\Notification;
use App\Models\Paiement;
use App\Models\User;
use App\Services\CalculLivraison;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use App\Models\PromoCode;
use App\Services\FideliteService;
use Illuminate\Support\Str;

class CommandeController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'mode_paiement' => 'required|string|in:Wave,Orange Money,Espèces',
            'panier' => 'required|array|min:1',
            'panier.*.produit_id' => 'required|exists:produits,id',
            'panier.*.quantite' => 'required|integer|min:1',
            'promo_code' => 'sometimes|string|exists:promo_codes,code',
            'points_used' => 'sometimes|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();

        try {
            $montantTotal = 0;
            $lignesAInserer = [];

            foreach ($request->panier as $item) {
                $produit = Produit::find($item['produit_id']);

                if ($produit->stock < $item['quantite']) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => "Stock insuffisant pour le produit : {$produit->nom}. (Disponible : {$produit->stock})"
                    ], 400);
                }

                $montantTotal += $produit->prix * $item['quantite'];

                $lignesAInserer[] = [
                    'produit_id' => $produit->id,
                    'quantite' => $item['quantite'],
                    'prix_unitaire' => $produit->prix
                ];

                $produit->decrement('stock', $item['quantite']);
                
                if ($produit->stock == 0) {
                    $produit->update(['disponibilite' => false]);
                }
            }

            $tauxCommission = 0.05; 
            $montantCommission = $montantTotal * $tauxCommission;

            $modePaiementMap = [
                'Wave' => 'wave',
                'Orange Money' => 'orange_money',
                'Espèces' => 'especes',
            ];
            $modePaiementDb = $modePaiementMap[$request->mode_paiement] ?? 'wave';

            $montantReduction = 0;
            $promoCodeId = null;
            $montantApresReduction = $montantTotal;
            $fidelitePointsUsed = 0;
            $montantReductionFidelite = 0;

            if ($request->promo_code) {
                $promo = PromoCode::where('code', $request->promo_code)->first();
                if ($promo && $promo->estValide() && $montantTotal >= $promo->montant_min_commande) {
                    $montantReduction = $promo->type === 'pourcentage'
                        ? ($montantTotal * $promo->valeur / 100)
                        : $promo->valeur;
                    $montantApresReduction = max(0, $montantTotal - $montantReduction);
                    $promoCodeId = $promo->id;
                }
            }

            if ($request->points_used > 0) {
                $montantReductionFidelite = FideliteService::redeemPoints(
                    $request->user()->id,
                    $request->points_used,
                ) ?? 0;
                if ($montantReductionFidelite > 0) {
                    $fidelitePointsUsed = $request->points_used;
                    $montantReduction += $montantReductionFidelite;
                    $montantApresReduction = max(0, $montantTotal - $montantReduction);
                }
            }

            $commande = Commande::create([
                'client_id' => $request->user()->id,
                'statut' => 'en_attente',
                'montant_total' => $montantTotal,
                'montant_commission' => $montantCommission,
                'mode_paiement' => $modePaiementDb,
                'promo_code_id' => $promoCodeId,
                'montant_reduction' => $montantReduction,
                'montant_total_apres_reduction' => $montantApresReduction,
                'fidelite_points_used' => $fidelitePointsUsed,
            ]);

            foreach ($lignesAInserer as $ligne) {
                LigneDeCommande::create([
                    'commande_id' => $commande->id,
                    'produit_id' => $ligne['produit_id'],
                    'quantite' => $ligne['quantite'],
                ]);
            }

            $montantPaiement = $montantApresReduction;

            Paiement::create([
                'commande_id' => $commande->id,
                'montant' => $montantPaiement,
                'part_vendeur' => $montantPaiement - ($montantPaiement * $tauxCommission),
                'part_commission' => $montantPaiement * $tauxCommission,
                'reference_prestataire' => 'MANUAL-' . strtoupper(Str::random(10)),
                'statut' => 'initie',
            ]);

            // Livraison créée uniquement quand le caissier valide le paiement
            // Livraison::create([
            //     'commande_id' => $commande->id,
            //     'statut' => 'disponible',
            // ]);

            DB::commit();

            $commande->load('lignes.produit.stand.vendeur');

            $infosLivraison = CalculLivraison::calculerPrixLivraison($commande);

            $commande->update([
                'prix_livraison' => $infosLivraison['prix_livraison'],
                'distance_km' => $infosLivraison['distance_km'],
            ]);

            $montantTotalAvecLivraison = $montantApresReduction + $infosLivraison['prix_livraison'];

            $msgNotif = "Votre commande #{$commande->id} a été enregistrée. Montant produits : " . number_format($montantTotal, 0, ',', ' ') . " FCFA.";
            if ($montantReduction > 0) {
                $msgNotif .= " Réduction : -" . number_format($montantReduction, 0, ',', ' ') . " FCFA.";
            }
            $msgNotif .= " Livraison estimée : " . number_format($infosLivraison['prix_livraison'], 0, ',', ' ') . " FCFA ({$infosLivraison['distance_km']} km). Total : " . number_format($montantTotalAvecLivraison, 0, ',', ' ') . " FCFA.";

            Notification::create([
                'user_id' => $request->user()->id,
                'type' => 'commande_confirmee',
                'message' => $msgNotif,
            ]);

            $cashiers = User::where('role', 'caissier')->get();
            foreach ($cashiers as $cashier) {
                $msgCaissier = "Nouvelle commande #{$commande->id} de {$request->user()->prenom} {$request->user()->nom} - "
                    . number_format($montantApresReduction, 0, ',', ' ') . " FCFA";
                if ($montantReduction > 0) {
                    $msgCaissier .= " (réduction de " . number_format($montantReduction, 0, ',', ' ') . " FCFA)";
                }
                $msgCaissier .= " en attente de validation.";
                Notification::create([
                    'user_id' => $cashier->id,
                    'type' => 'nouvelle_commande',
                    'message' => $msgCaissier,
                ]);
            }

            if ($promoCodeId) {
                $promo->increment('utilisation_count');
            }

            return response()->json([
                'success' => true,
                'message' => 'Commande enregistrée avec succès !',
                'commande_id' => $commande->id,
                'montant_produits' => $montantTotal,
                'montant_reduction' => $montantReduction,
                'montant_apres_reduction' => $montantApresReduction,
                'fidelite_points_used' => $fidelitePointsUsed,
                'prix_livraison' => $infosLivraison['prix_livraison'],
                'distance_km' => $infosLivraison['distance_km'],
                'montant_total' => $montantTotalAvecLivraison,
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Erreur lors du traitement de la commande.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function mesCommandes(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'client') {
            $commandes = Commande::with(['lignes.produit', 'livraison'])->where('client_id', $user->id)->latest()->get();
        } 
        elseif ($user->role === 'admin') {
            $commandes = Commande::with(['client', 'lignes.produit', 'livraison.livreur.user'])->latest()->get();
        } 
        elseif ($user->role === 'vendeur') {
            $stand = $user->stand;
            $standId = $stand?->id;
            \Log::info("VENDEUR CMD DEBUG: user_id={$user->id}, stand=" . json_encode($stand ? ['id'=>$stand->id, 'nom'=>$stand->nom] : null));
            if ($standId) {
                $produitIds = Produit::where('stand_id', $standId)->pluck('id');
                \Log::info("VENDEUR CMD DEBUG: produit_ids=" . $produitIds->toJson());
                $allCommandesCount = Commande::count();
                $lignesCount = DB::table('ligne_de_commandes')->whereIn('produit_id', $produitIds)->count();
                \Log::info("VENDEUR CMD DEBUG: total_commandes={$allCommandesCount}, lignes_matching={$lignesCount}");
                $commandes = Commande::with(['client:id,nom,prenom,telephone', 'lignes.produit', 'livraison'])
                    ->whereHas('lignes', function ($q) use ($produitIds) {
                        $q->whereIn('produit_id', $produitIds);
                    })
                    ->latest()
                    ->get();
                \Log::info("VENDEUR CMD DEBUG: found=" . $commandes->count());
            } else {
                $commandes = [];
                \Log::info("VENDEUR CMD DEBUG: no stand found for user_id={$user->id}");
            }
        }
        else {
            $commandes = [];
        }

        return response()->json([
            'success' => true,
            'data' => $commandes
        ], 200);
    }
}
