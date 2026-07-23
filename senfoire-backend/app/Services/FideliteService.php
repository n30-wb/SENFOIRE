<?php

namespace App\Services;

use App\Models\FideliteClient;
use App\Models\FideliteHistorique;
use App\Models\Commande;

class FideliteService
{
    // Points per FCFA spent
    const POINTS_PER_1000_FCFA = 1;

    // Tier thresholds (total_points_gagnes)
    const TIERS = [
        'bronze' => 0,
        'argent' => 50,
        'or' => 200,
        'diamant' => 500,
    ];

    // Discount per tier
    const TIER_DISCOUNTS = [
        'bronze' => 0,
        'argent' => 2,
        'or' => 5,
        'diamant' => 10,
    ];

    /**
     * Get or create loyalty record for a client
     */
    public static function getOrCreate(int $clientId): FideliteClient
    {
        return FideliteClient::firstOrCreate(
            ['client_id' => $clientId],
            ['points' => 0, 'total_points_gagnes' => 0, 'niveau' => 'bronze']
        );
    }

    /**
     * Award points for a completed order
     */
    public static function awardPoints(int $clientId, float $montant, ?int $commandeId = null): FideliteClient
    {
        $fidelite = self::getOrCreate($clientId);
        $points = (int) floor($montant / 1000 * self::POINTS_PER_1000_FCFA);

        if ($points <= 0) {
            return $fidelite;
        }

        $fidelite->increment('points', $points);
        $fidelite->increment('total_points_gagnes', $points);

        // Check tier upgrade
        $newTier = self::calculateTier($fidelite->total_points_gagnes);
        if ($newTier !== $fidelite->niveau) {
            $fidelite->update(['niveau' => $newTier]);
        }

        FideliteHistorique::create([
            'client_id' => $clientId,
            'points' => $points,
            'type' => 'gain',
            'description' => "Points gagnés pour la commande #{$commandeId}",
            'commande_id' => $commandeId,
        ]);

        return $fidelite->fresh();
    }

    /**
     * Redeem points (use as discount)
     */
    public static function redeemPoints(int $clientId, int $points, ?int $commandeId = null): ?int
    {
        $fidelite = self::getOrCreate($clientId);

        if ($fidelite->points < $points || $points <= 0) {
            return null;
        }

        $fidelite->decrement('points', $points);

        FideliteHistorique::create([
            'client_id' => $clientId,
            'points' => -$points,
            'type' => 'redemption',
            'description' => "Points utilisés en réduction",
            'commande_id' => $commandeId,
        ]);

        // Convert points to FCFA: 1 point = 10 FCFA
        return $points * 10;
    }

    /**
     * Get tier discount percentage
     */
    public static function getTierDiscount(string $niveau): float
    {
        return self::TIER_DISCOUNTS[$niveau] ?? 0;
    }

    /**
     * Calculate tier based on total points
     */
    private static function calculateTier(int $totalPoints): string
    {
        $tier = 'bronze';
        foreach (self::TIERS as $name => $threshold) {
            if ($totalPoints >= $threshold) {
                $tier = $name;
            }
        }
        return $tier;
    }

    /**
     * Get client loyalty summary
     */
    public static function getSummary(int $clientId): array
    {
        $fidelite = self::getOrCreate($clientId);
        $history = FideliteHistorique::where('client_id', $clientId)
            ->latest()
            ->limit(20)
            ->get();

        return [
            'points' => $fidelite->points,
            'total_points_gagnes' => $fidelite->total_points_gagnes,
            'niveau' => $fidelite->niveau,
            'remise_pct' => self::getTierDiscount($fidelite->niveau),
            'prochain_niveau' => self::getNextTier($fidelite->niveau),
            'points_pour_prochain_niveau' => self::pointsForNextTier($fidelite->total_points_gagnes),
            'historique' => $history,
        ];
    }

    private static function getNextTier(string $current): ?string
    {
        $order = ['bronze', 'argent', 'or', 'diamant'];
        $idx = array_search($current, $order);
        if ($idx !== false && $idx < count($order) - 1) {
            return $order[$idx + 1];
        }
        return null;
    }

    private static function pointsForNextTier(int $totalPoints): int
    {
        $next = self::getNextTier(
            self::calculateTier($totalPoints)
        );
        if (!$next) return 0;
        return max(0, self::TIERS[$next] - $totalPoints);
    }
}
