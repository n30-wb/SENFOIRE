<?php

namespace App\Http\Controllers;

use App\Models\AlerteStock;
use App\Models\Produit;
use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class AlerteStockController extends Controller
{
    public function store(Request $request)
    {
        $user = $request->user();
        $produitId = $request->produit_id;

        $produit = Produit::find($produitId);
        if (!$produit) {
            return response()->json(['success' => false, 'message' => 'Produit introuvable.'], 404);
        }

        $existing = AlerteStock::where('user_id', $user->id)->where('produit_id', $produitId)->first();
        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Alerte déjà configurée pour ce produit.'], 400);
        }

        AlerteStock::create([
            'user_id' => $user->id,
            'produit_id' => $produitId,
        ]);

        return response()->json(['success' => true, 'message' => 'Alerte configurée. Vous serez notifié quand le produit sera de nouveau disponible.'], 201);
    }

    public function destroy(Request $request, $id)
    {
        $alerte = AlerteStock::where('id', $id)->where('user_id', $request->user()->id)->first();
        if (!$alerte) {
            return response()->json(['success' => false, 'message' => 'Alerte introuvable.'], 404);
        }
        $alerte->delete();
        return response()->json(['success' => true, 'message' => 'Alerte supprimée.']);
    }

    public function mesAlertes(Request $request)
    {
        $alertes = AlerteStock::with('produit')->where('user_id', $request->user()->id)->get();
        return response()->json(['success' => true, 'data' => $alertes]);
    }
}
