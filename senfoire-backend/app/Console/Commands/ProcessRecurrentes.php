<?php

namespace App\Console\Commands;

use App\Models\CommandeRecurrente;
use App\Models\CommandeRecurrenteProduit;
use App\Models\Commande;
use App\Models\LigneDeCommande;
use App\Models\Paiement;
use App\Models\Produit;
use App\Models\Notification;
use App\Services\CalculLivraison;
use App\Services\NotificationService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProcessRecurrentes extends Command
{
    protected $signature = 'commandes:process-recurrentes';
    protected $description = 'Process recurring orders that are due';

    public function handle(): int
    {
        $due = CommandeRecurrente::where('active', true)
            ->where('prochaine_commande', '<=', now()->toDateString())
            ->get();

        $processed = 0;

        foreach ($due as $commandeRecurrente) {
            try {
                DB::beginTransaction();

                $produits = CommandeRecurrenteProduit::where('commande_recurrente_id', $commandeRecurrente->id)->get();

                if ($produits->isEmpty()) {
                    $commandeRecurrente->update(['active' => false]);
                    DB::commit();
                    continue;
                }

                $montantTotal = 0;
                $lignesAInserer = [];
                $allStockOk = true;

                foreach ($produits as $item) {
                    $produit = Produit::find($item->produit_id);
                    if (!$produit || $produit->stock < $item->quantite) {
                        $allStockOk = false;
                        break;
                    }
                    $montantTotal += $produit->prix * $item->quantite;
                    $lignesAInserer[] = [
                        'produit_id' => $produit->id,
                        'quantite' => $item->quantite,
                    ];
                }

                if (!$allStockOk) {
                    DB::rollBack();
                    NotificationService::sendPushNotification(
                        $commandeRecurrente->client_id,
                        'Commande récurrente',
                        'Stock insuffisant pour votre commande récurrente. Commande reportée.',
                        ['type' => 'commande_recurrente']
                    );
                    // Defer by 3 days
                    $commandeRecurrente->update(['prochaine_commande' => now()->addDays(3)->toDateString()]);
                    continue;
                }

                $tauxCommission = 0.05;
                $montantCommission = $montantTotal * $tauxCommission;

                $commande = Commande::create([
                    'client_id' => $commandeRecurrente->client_id,
                    'statut' => 'en_attente',
                    'montant_total' => $montantTotal,
                    'montant_commission' => $montantCommission,
                    'mode_paiement' => 'wave',
                    'montant_total_apres_reduction' => $montantTotal,
                ]);

                foreach ($lignesAInserer as $ligne) {
                    LigneDeCommande::create([
                        'commande_id' => $commande->id,
                        'produit_id' => $ligne['produit_id'],
                        'quantite' => $ligne['quantite'],
                    ]);
                    Produit::where('id', $ligne['produit_id'])->decrement('stock', $ligne['quantite']);
                }

                Paiement::create([
                    'commande_id' => $commande->id,
                    'montant' => $montantTotal,
                    'part_vendeur' => $montantTotal - $montantCommission,
                    'part_commission' => $montantCommission,
                    'reference_prestataire' => 'RECURRENT-' . strtoupper(Str::random(10)),
                    'statut' => 'initie',
                ]);

                $commande->load('lignes.produit.stand.vendeur');
                $infosLivraison = CalculLivraison::calculerPrixLivraison($commande);
                $commande->update([
                    'prix_livraison' => $infosLivraison['prix_livraison'],
                    'distance_km' => $infosLivraison['distance_km'],
                ]);

                // Notify caissiers
                $caissiers = \App\Models\User::where('role', 'caissier')->pluck('id')->toArray();
                foreach ($caissiers as $caissierId) {
                    NotificationService::sendPushNotification(
                        $caissierId,
                        'Commande récurrente',
                        "Nouvelle commande récurrente #{$commande->id} de " . number_format($montantTotal, 0, ',', ' ') . " FCFA.",
                        ['type' => 'nouvelle_commande', 'commande_id' => $commande->id]
                    );
                }

                // Schedule next
                $nextDate = match ($commandeRecurrente->frequence) {
                    'hebdomadaire' => now()->addWeek(),
                    'bimensuel' => now()->addDays(15),
                    'mensuel' => now()->addMonth(),
                    default => now()->addMonth(),
                };
                $commandeRecurrente->update(['prochaine_commande' => $nextDate->toDateString()]);

                DB::commit();
                $processed++;

            } catch (\Exception $e) {
                DB::rollBack();
                $this->error("Error processing recurring order #{$commandeRecurrente->id}: " . $e->getMessage());
            }
        }

        $this->info("Processed {$processed} recurring orders.");
        return Command::SUCCESS;
    }
}
