<?php

namespace App\Http\Controllers;

use App\Models\Livreur;
use App\Models\LivreurRating;
use App\Models\Livraison;
use App\Models\Commande;
use App\Models\Notification;
use App\Models\User;
use App\Events\OrderStatusEvent;
use App\Services\CalculLivraison;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class LivreurController extends Controller
{
    public function profile(Request $request)
    {
        $livreur = Livreur::where('user_id', $request->user()->id)->first();

        if (!$livreur) {
            return response()->json(['success' => false, 'message' => 'Profil livreur introuvable.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $livreur
        ], 200);
    }

    public function toggleDisponibilite(Request $request)
    {
        $livreur = Livreur::where('user_id', $request->user()->id)->first();

        if (!$livreur) {
            return response()->json(['success' => false, 'message' => 'Profil livreur introuvable.'], 404);
        }

        $livreur->update([
            'disponibilite' => !$livreur->disponibilite
        ]);

        return response()->json([
            'success' => true,
            'message' => $livreur->disponibilite ? 'Vous êtes maintenant disponible.' : 'Vous êtes maintenant hors ligne.',
            'data' => $livreur
        ], 200);
    }

    public function livraisonsDisponibles(Request $request)
    {
        $livreur = Livreur::where('user_id', $request->user()->id)->first();

        $livraisons = Livraison::where('statut', 'disponible')
            ->whereHas('commande', function ($q) {
                $q->where('valide_caissier', true);
            })
            ->with(['commande.client:id,nom,telephone,latitude,longitude'])
            ->get();

        $data = $livraisons->map(function ($livraison) use ($livreur) {
            $commande = $livraison->commande;
            $nbArticles = $commande->lignes()->sum('quantite');

            $distanceClientLivreur = null;
            if ($livreur && $livreur->user && $commande->client) {
                $livreurUser = $livreur->user;
                if ($livreurUser->latitude && $livreurUser->longitude && $commande->client->latitude && $commande->client->longitude) {
                    $distanceClientLivreur = round(CalculLivraison::getDistanceHaversine(
                        $livreurUser->latitude, $livreurUser->longitude,
                        $commande->client->latitude, $commande->client->longitude
                    ), 2);
                }
            }

            return [
                'id' => $livraison->id,
                'commande_id' => $commande->id,
                'client' => $commande->client->nom ?? 'N/A',
                'client_prenom' => $commande->client->prenom ?? '',
                'telephone' => $commande->client->telephone ?? 'N/A',
                'client_latitude' => $commande->client->latitude,
                'client_longitude' => $commande->client->longitude,
                'articles' => $nbArticles,
                'montant' => (float) $commande->montant_total,
                'prix_livraison' => (float) $commande->prix_livraison,
                'distance_km' => $distanceClientLivreur,
                'statut' => $livraison->statut,
                'date' => $livraison->created_at->format('Y-m-d'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ], 200);
    }

    public function mesLivraisons(Request $request)
    {
        $livreur = Livreur::where('user_id', $request->user()->id)->first();

        if (!$livreur) {
            return response()->json(['success' => false, 'message' => 'Profil livreur introuvable.'], 404);
        }

        $livraisons = Livraison::where('livreur_id', $livreur->id)
            ->with(['commande.client:id,nom,telephone,latitude,longitude'])
            ->latest()
            ->get();

        $data = $livraisons->map(function ($livraison) {
            $commande = $livraison->commande;
            $nbArticles = $commande->lignes()->sum('quantite');
            return [
                'id' => $livraison->id,
                'commande_id' => $commande->id,
                'client' => $commande->client->nom ?? 'N/A',
                'client_prenom' => $commande->client->prenom ?? '',
                'telephone' => $commande->client->telephone ?? 'N/A',
                'client_latitude' => $commande->client->latitude,
                'client_longitude' => $commande->client->longitude,
                'articles' => $nbArticles,
                'montant' => (float) $commande->montant_total,
                'prix_livraison' => (float) $commande->prix_livraison,
                'statut' => $livraison->statut,
                'date' => $livraison->created_at->format('Y-m-d'),
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data
        ], 200);
    }

    public function accepter(Request $request, $id)
    {
        $livraison = Livraison::find($id);

        if (!$livraison) {
            return response()->json(['success' => false, 'message' => 'Livraison introuvable.'], 404);
        }

        if ($livraison->statut !== 'disponible') {
            return response()->json(['success' => false, 'message' => 'Cette livraison n\'est plus disponible.'], 400);
        }

        $livreur = Livreur::where('user_id', $request->user()->id)->first();

        if (!$livreur) {
            return response()->json(['success' => false, 'message' => 'Profil livreur introuvable.'], 404);
        }

        if (!$livreur->disponibilite) {
            return response()->json(['success' => false, 'message' => 'Vous devez être disponible pour accepter une livraison.'], 400);
        }

        $livraison->update([
            'livreur_id' => $livreur->id,
            'statut' => 'prise_en_charge',
        ]);

        Commande::where('id', $livraison->commande_id)
            ->update(['statut' => 'en_cours_livraison']);

        $commande = Commande::with('client')->find($livraison->commande_id);

        if ($commande && $commande->client) {
            $livreurUser = User::find($livreur->user_id);
            $nomComplet = $livreurUser->prenom . ' ' . $livreurUser->nom;
            $prixLivraison = number_format($commande->prix_livraison, 0, ',', ' ');

            Notification::create([
                'user_id' => $commande->client_id,
                'type' => 'livraison_en_cours',
                'message' => "Votre colis est en cours de livraison ! Livreur : {$nomComplet}. Prix livraison : {$prixLivraison} FCFA. Vous pouvez suivre sa position en temps réel.",
            ]);
        }

        // Broadcast status change
        broadcast(new OrderStatusEvent($commande, 'en_cours_livraison'));

        return response()->json([
            'success' => true,
            'message' => 'Livraison acceptée avec succès !',
            'data' => $livraison
        ], 200);
    }

    public function marquerLivree(Request $request, $id)
    {
        $livraison = Livraison::find($id);

        if (!$livraison) {
            return response()->json(['success' => false, 'message' => 'Livraison introuvable.'], 404);
        }

        if ($livraison->statut !== 'prise_en_charge') {
            return response()->json(['success' => false, 'message' => 'Cette livraison ne peut pas être marquée comme livrée.'], 400);
        }

        $livreur = Livreur::where('user_id', $request->user()->id)->first();

        if (!$livreur || $livraison->livreur_id !== $livreur->id) {
            return response()->json(['success' => false, 'message' => 'Vous n\'êtes pas assigné à cette livraison.'], 403);
        }

        $livraison->update([
            'statut' => 'livree',
            'date_livraison' => now(),
        ]);

        Commande::where('id', $livraison->commande_id)
            ->update(['statut' => 'livree']);

        $livreur->increment('points_mensuels', 10);

        $commande = Commande::with('client')->find($livraison->commande_id);
        if ($commande && $commande->client) {
            Notification::create([
                'user_id' => $commande->client_id,
                'type' => 'livraison_terminee',
                'message' => "Votre commande #{$commande->id} a été livrée avec succès !",
            ]);
        }

        // Broadcast delivery completed
        broadcast(new OrderStatusEvent($commande, 'livree'));

        return response()->json([
            'success' => true,
            'message' => 'Livraison confirmée ! +10 points.',
            'data' => $livraison
        ], 200);
    }

    public function noterLivraison(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $livraison = Livraison::find($id);
        if (!$livraison) {
            return response()->json(['success' => false, 'message' => 'Livraison introuvable.'], 404);
        }

        $existing = LivreurRating::where('livraison_id', $id)
            ->where('client_id', $request->user()->id)
            ->first();

        if ($existing) {
            return response()->json(['success' => false, 'message' => 'Vous avez déjà noté cette livraison.'], 400);
        }

        $rating = LivreurRating::create([
            'livraison_id' => $id,
            'client_id' => $request->user()->id,
            'livreur_id' => $livraison->livreur_id,
            'note' => $request->note,
            'commentaire' => $request->commentaire,
        ]);

        return response()->json(['success' => true, 'message' => 'Merci pour votre évaluation !', 'data' => $rating], 201);
    }
}
