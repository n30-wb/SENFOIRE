<?php

namespace App\Http\Controllers;

use App\Services\FideliteService;
use Illuminate\Http\Request;

class FideliteController extends Controller
{
    public function summary(Request $request)
    {
        $summary = FideliteService::getSummary($request->user()->id);
        return response()->json(['success' => true, 'data' => $summary]);
    }

    public function redeem(Request $request)
    {
        $validated = $request->validate([
            'points' => 'required|integer|min:1',
        ]);

        $montantReduction = FideliteService::redeemPoints(
            $request->user()->id,
            $validated['points']
        );

        if ($montantReduction === null) {
            return response()->json(['success' => false, 'message' => 'Points insuffisants ou montant invalide.'], 400);
        }

        return response()->json([
            'success' => true,
            'message' => "{$validated['points']} points convertis en {$montantReduction} FCFA de réduction.",
            'montant_reduction' => $montantReduction,
        ]);
    }
}
