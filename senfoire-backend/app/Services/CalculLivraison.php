<?php

namespace App\Services;

use App\Models\Commande;
use App\Models\Stand;
use App\Models\User;

class CalculLivraison
{
    const TARIF_BASE_PAR_KM = 100;
    const FRAIS_SUPPLEMENT_BOUTIQUE = 500;

    public static function calculerPrixLivraison(Commande $commande): array
    {
        $client = $commande->client;

        if (!$client || $client->latitude === null || $client->longitude === null) {
            return [
                'prix_livraison' => 0,
                'distance_km' => 0,
                'distance_max_km' => 0,
                'nb_boutiques' => 0,
            ];
        }

        $lignes = $commande->lignes()->with('produit.stand')->get();

        $standDistances = [];
        $standsVisites = [];

        foreach ($lignes as $ligne) {
            $produit = $ligne->produit;
            if (!$produit || !$produit->stand) continue;

            $standId = $produit->stand_id;
            if (in_array($standId, $standsVisites)) continue;
            $standsVisites[] = $standId;

            $stand = $produit->stand;
            $vendeur = $stand->vendeur;

            if (!$vendeur || $vendeur->latitude === null || $vendeur->longitude === null) continue;

            $distance = self::getDistanceHaversine(
                $client->latitude,
                $client->longitude,
                $vendeur->latitude,
                $vendeur->longitude
            );

            $standDistances[$standId] = [
                'stand' => $stand->nom,
                'distance' => $distance,
            ];
        }

        if (empty($standDistances)) {
            return [
                'prix_livraison' => 0,
                'distance_km' => 0,
                'distance_max_km' => 0,
                'nb_boutiques' => 0,
            ];
        }

        usort($standDistances, fn($a, $b) => $b['distance'] <=> $a['distance']);

        $distanceMax = $standDistances[0]['distance'];
        $nbBoutiques = count($standDistances);

        $prixBase = round($distanceMax * self::TARIF_BASE_PAR_KM);
        $prixSupplement = ($nbBoutiques - 1) * self::FRAIS_SUPPLEMENT_BOUTIQUE;
        $prixTotal = max($prixBase + $prixSupplement, 500);

        return [
            'prix_livraison' => $prixTotal,
            'distance_km' => round($distanceMax, 2),
            'distance_max_km' => round($distanceMax, 2),
            'nb_boutiques' => $nbBoutiques,
            'details' => $standDistances,
        ];
    }

    public static function getDistanceHaversine(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $rayonTerre = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $rayonTerre * $c;
    }
}
