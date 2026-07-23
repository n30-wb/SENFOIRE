<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Stand;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\Inscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AdminController extends Controller
{
    /**
     * Liste de tous les utilisateurs
     */
    public function users()
    {
        $users = User::select('id', 'nom', 'prenom', 'email', 'telephone', 'pseudo', 'role', 'created_at')->get();

        return response()->json([
            'success' => true,
            'data' => $users
        ], 200);
    }

    /**
     * Créer un utilisateur directement par l'admin
     */
    public function createUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'telephone' => 'required|string|unique:users',
            'role' => 'required|string|in:client,vendeur,livreur,admin,caissier',
            'pseudo' => 'nullable|string|unique:users',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telephone' => $request->telephone,
            'role' => $request->role,
            'pseudo' => $request->pseudo,
        ]);

        if ($user->role === 'livreur') {
            \App\Models\Livreur::create([
                'user_id' => $user->id,
                'points_mensuels' => 0,
                'disponibilite' => false,
            ]);
        }

        if ($user->role === 'vendeur') {
            Stand::create([
                'user_id' => $user->id,
                'nom' => "Stand de {$user->prenom} {$user->nom}",
                'description' => '',
                'localisation' => 'SENFOIRE',
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur créé avec succès.',
            'user' => $user,
        ], 201);
    }

    /**
     * Supprimer un utilisateur
     */
    public function deleteUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Utilisateur introuvable.'], 404);
        }

        if ($user->role === 'admin') {
            return response()->json(['success' => false, 'message' => 'Impossible de supprimer un administrateur.'], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé avec succès.'
        ], 200);
    }

    /**
     * Liste de tous les stands avec info vendeur
     */
    public function stands()
    {
        $stands = Stand::with('vendeur:id,nom,email')->get();

        return response()->json([
            'success' => true,
            'data' => $stands
        ], 200);
    }

    /**
     * Liste de toutes les commandes (avec client et lignes)
     */
    public function commandes()
    {
        $commandes = Commande::with(['client:id,nom,email,telephone', 'lignes.produit', 'livraison'])
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $commandes
        ], 200);
    }

    /**
     * Statistiques globales pour le dashboard
     */
    public function stats()
    {
        $totalUsers = User::count();
        $totalStands = Stand::count();
        $totalProduits = Produit::count();
        $totalCommandes = Commande::count();
        $totalLivraisons = \App\Models\Livraison::count();
        $chiffreAffaires = Commande::where('statut', 'livree')->sum('montant_total');

        return response()->json([
            'success' => true,
            'data' => [
                'users' => $totalUsers,
                'stands' => $totalStands,
                'produits' => $totalProduits,
                'commandes' => $totalCommandes,
                'livraisons' => $totalLivraisons,
                'chiffre_affaires' => (float) $chiffreAffaires,
            ]
        ], 200);
    }

    /**
     * Créer un compte caissier
     */
    public function creerCaissier(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'nom' => $request->nom,
            'prenom' => $request->prenom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telephone' => $request->telephone ?? '',
            'role' => 'caissier',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Compte caissier créé avec succès.',
            'user' => $user,
        ], 201);
    }
}
