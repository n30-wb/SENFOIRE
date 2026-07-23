<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Livreur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Inscription d'un Client ou d'un Livreur (Inscriptions publiques)
     */
    public function register(Request $request)
    {
        // 1. Validation des données reçues
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
            'telephone' => 'required|string|unique:users',
            'role' => 'required|string|in:client,livreur', // Seuls les clients et livreurs peuvent s'inscrire librement
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // 2. Création de l'utilisateur de base
        $user = User::create([
            'nom' => $request->nom,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telephone' => $request->telephone,
            'role' => $request->role,
        ]);

        // 3. Logique spécifique selon le rôle choisi
        if ($user->role === 'livreur') {
            // Création automatique du profil de livreur en attente de validation administrative
            Livreur::create([
                'user_id' => $user->id,
                'points_mensuels' => 0,
                'disponibilite' => false, // Désactivé par défaut tant que l'admin ne l'a pas validé
            ]);
        }

        // 4. Génération du Token d'accès Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Inscription réussie avec succès !',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201); // Modifié de 21 à 201 (Created)
    }

    /**
     * Connexion globale pour tous les acteurs (Admin, Vendeur, Client, Livreur)
     * Accepte email, telephone OU pseudo comme identifiant
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'identifiant' => 'required|string',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 400);
        }

        $identifiant = $request->identifiant;

        $user = User::where('email', $identifiant)
            ->orWhere('telephone', $identifiant)
            ->orWhere('pseudo', $identifiant)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Identifiants de connexion incorrects.'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Connexion réussie, bienvenue ' . $user->nom,
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
                'telephone' => $user->telephone,
                'pseudo' => $user->pseudo,
            ]
        ], 200);
    }

    /**
     * Déconnexion (Révocation du Token)
     */
    public function logout(Request $request)
    {
        // Supprime le token actuel de l'utilisateur connecté
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Déconnexion réussie. Token révoqué.'
        ], 200); // Modifié de 20 à 200 (OK)
    }
}