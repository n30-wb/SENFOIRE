<?php

namespace App\Http\Controllers;

use App\Events\LocationUpdateEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LocationController extends Controller
{
    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $user->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Position mise à jour.',
            'data' => [
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
            ],
        ], 200);
    }

    public function getLocation($userId)
    {
        $user = \App\Models\User::select('id', 'nom', 'prenom', 'latitude', 'longitude')->find($userId);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Utilisateur introuvable.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user,
        ], 200);
    }

    public function getLivreurLocation(Request $request, $commandeId)
    {
        $commande = \App\Models\Commande::find($commandeId);

        if (!$commande) {
            return response()->json(['success' => false, 'message' => 'Commande introuvable.'], 404);
        }

        $livraison = $commande->livraison;

        if (!$livraison || !$livraison->livreur_id) {
            return response()->json(['success' => false, 'message' => 'Aucun livreur assigné.'], 404);
        }

        $livreur = \App\Models\Livreur::find($livraison->livreur_id);

        if (!$livreur) {
            return response()->json(['success' => false, 'message' => 'Livreur introuvable.'], 404);
        }

        $user = $livreur->user;

        return response()->json([
            'success' => true,
            'data' => [
                'livreur_id' => $livreur->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'photo_cni' => $user->photo_cni,
                'latitude' => $user->latitude,
                'longitude' => $user->longitude,
            ],
        ], 200);
    }

    public function updateLivreurLocation(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'commande_id' => 'sometimes|exists:commandes,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $user->update([
            'latitude' => $request->latitude,
            'longitude' => $request->longitude,
        ]);

        // Broadcast location to the specific commande channel if provided
        if ($request->commande_id) {
            $livreur = \App\Models\Livreur::where('user_id', $user->id)->first();
            if ($livreur) {
                broadcast(new LocationUpdateEvent(
                    $livreur->id,
                    $request->latitude,
                    $request->longitude,
                    $request->commande_id
                ));
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Position livreur mise à jour.',
        ], 200);
    }
}
