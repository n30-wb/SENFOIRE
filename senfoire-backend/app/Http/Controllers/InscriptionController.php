<?php

namespace App\Http\Controllers;

use App\Models\Inscription;
use App\Models\User;
use App\Models\Notification;
use App\Models\Stand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class InscriptionController extends Controller
{
    public function store(Request $request)
    {
        $rules = [
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'telephone' => 'required|string|unique:users,telephone|unique:inscriptions,telephone',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'required|string|in:client,vendeur,livreur',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ];

        if ($request->role === 'client') {
            $rules['pseudo'] = 'required|string|unique:users,pseudo|unique:inscriptions,pseudo';
            $rules['email'] = 'nullable|string|email|unique:users,email|unique:inscriptions,email';
            $rules['cni'] = 'nullable|string';
        } else {
            $rules['email'] = 'required|string|email|unique:users,email|unique:inscriptions,email';
            $rules['cni'] = 'required|string';
            $rules['photo_cni'] = 'required|image|max:5120';
        }

        if ($request->role === 'vendeur') {
            $rules['nom_stand'] = 'required|string|max:255';
            $rules['description_stand'] = 'nullable|string|max:1000';
        }

        if ($request->role === 'livreur') {
            $rules['date_naissance'] = 'required|date';
            $rules['lieu_naissance'] = 'required|string|max:255';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        $data['password'] = Hash::make($data['password']);
        $data['statut'] = 'en_attente';

        if ($request->hasFile('photo_cni')) {
            $data['photo_cni'] = $request->file('photo_cni')->store('inscriptions', 'public');
        }

        $inscription = Inscription::create($data);

        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'type' => 'nouvelle_inscription',
                'message' => "Nouvelle inscription en attente : {$inscription->prenom} {$inscription->nom} ({$inscription->role})",
            ]);
        }

        if ($request->role === 'client') {
            $user = User::create([
                'nom' => $inscription->nom,
                'prenom' => $inscription->prenom,
                'email' => $inscription->email,
                'password' => $inscription->password,
                'telephone' => $inscription->telephone,
                'pseudo' => $inscription->pseudo,
                'role' => 'client',
                'cni' => $inscription->cni,
            ]);

            $inscription->update(['statut' => 'approuve']);

            Notification::create([
                'user_id' => $user->id,
                'type' => 'inscription_approuvee',
                'message' => 'Votre compte client a été créé avec succès. Bienvenue sur SENFOIRE !',
            ]);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Inscription réussie ! Bienvenue sur SENFOIRE.',
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
                ],
                'inscription_id' => $inscription->id,
            ], 201);
        }

        return response()->json([
            'success' => true,
            'message' => 'Votre demande d\'inscription a été soumise. Vous recevrez une notification une fois votre compte validé par l\'administrateur.',
            'inscription_id' => $inscription->id,
        ], 201);
    }

    public function index()
    {
        $inscriptions = Inscription::where('statut', 'en_attente')->latest()->get();

        return response()->json([
            'success' => true,
            'data' => $inscriptions,
        ], 200);
    }

    public function all()
    {
        $inscriptions = Inscription::latest()->get();

        return response()->json([
            'success' => true,
            'data' => $inscriptions,
        ], 200);
    }

    public function show($id)
    {
        $inscription = Inscription::find($id);

        if (!$inscription) {
            return response()->json(['success' => false, 'message' => 'Inscription introuvable.'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $inscription,
        ], 200);
    }

    public function approuver($id)
    {
        $inscription = Inscription::find($id);

        if (!$inscription) {
            return response()->json(['success' => false, 'message' => 'Inscription introuvable.'], 404);
        }

        if ($inscription->statut !== 'en_attente') {
            return response()->json(['success' => false, 'message' => 'Cette inscription a déjà été traitée.'], 400);
        }

        $userData = [
            'nom' => $inscription->nom,
            'prenom' => $inscription->prenom,
            'email' => $inscription->email,
            'password' => $inscription->password,
            'telephone' => $inscription->telephone,
            'role' => $inscription->role,
            'cni' => $inscription->cni,
            'photo_cni' => $inscription->photo_cni,
            'date_naissance' => $inscription->date_naissance,
            'lieu_naissance' => $inscription->lieu_naissance,
        ];

        $user = User::create($userData);

        if ($inscription->role === 'livreur') {
            \App\Models\Livreur::create([
                'user_id' => $user->id,
                'points_mensuels' => 0,
                'disponibilite' => false,
            ]);
        }

        if ($inscription->role === 'vendeur') {
            Stand::create([
                'user_id' => $user->id,
                'nom' => $inscription->nom_stand ?: "Stand de {$user->prenom} {$user->nom}",
                'description' => $inscription->description_stand ?: '',
                'localisation' => 'SENFOIRE',
            ]);
        }

        $inscription->update(['statut' => 'approuve']);

        Notification::create([
            'user_id' => null,
            'type' => 'inscription_approuvee',
            'message' => "Inscription de {$inscription->prenom} {$inscription->nom} ({$inscription->role}) approuvée.",
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inscription approuvée. Le compte a été créé.',
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 200);
    }

    public function rejeter(Request $request, $id)
    {
        $inscription = Inscription::find($id);

        if (!$inscription) {
            return response()->json(['success' => false, 'message' => 'Inscription introuvable.'], 404);
        }

        if ($inscription->statut !== 'en_attente') {
            return response()->json(['success' => false, 'message' => 'Cette inscription a déjà été traitée.'], 400);
        }

        $request->validate([
            'motif_rejet' => 'nullable|string|max:500',
        ]);

        $inscription->update([
            'statut' => 'rejete',
            'motif_rejet' => $request->motif_rejet,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Inscription rejetée.',
        ], 200);
    }

    public function checkStatut(Request $request, $id)
    {
        $inscription = Inscription::find($id);

        if (!$inscription) {
            return response()->json(['success' => false, 'message' => 'Inscription introuvable.'], 404);
        }

        return response()->json([
            'success' => true,
            'statut' => $inscription->statut,
            'motif_rejet' => $inscription->motif_rejet,
        ], 200);
    }

    public function finaliserCompte(Request $request, $id)
    {
        $inscription = Inscription::find($id);

        if (!$inscription) {
            return response()->json(['success' => false, 'message' => 'Inscription introuvable.'], 404);
        }

        if ($inscription->statut !== 'approuve') {
            return response()->json(['success' => false, 'message' => 'Votre inscription n\'a pas encore été approuvée.'], 400);
        }

        $existingUser = User::where('email', $inscription->email)->first();

        if ($existingUser) {
            if ($inscription->role === 'vendeur' && !$existingUser->stand) {
                Stand::create([
                    'user_id' => $existingUser->id,
                    'nom' => $inscription->nom_stand ?: "Stand de {$existingUser->prenom} {$existingUser->nom}",
                    'description' => $inscription->description_stand ?: '',
                    'localisation' => 'SENFOIRE',
                ]);
            }

            $token = $existingUser->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Compte déjà finalisé.',
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $existingUser->id,
                    'nom' => $existingUser->nom,
                    'prenom' => $existingUser->prenom,
                    'email' => $existingUser->email,
                    'role' => $existingUser->role,
                    'telephone' => $existingUser->telephone,
                ],
            ], 200);
        }

        $validator = Validator::make($request->all(), [
            'identifiant' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'nom' => $inscription->nom,
            'prenom' => $inscription->prenom,
            'email' => $inscription->email,
            'password' => Hash::make($request->password),
            'telephone' => $inscription->telephone,
            'pseudo' => $inscription->pseudo,
            'role' => $inscription->role,
            'cni' => $inscription->cni,
            'photo_cni' => $inscription->photo_cni,
            'date_naissance' => $inscription->date_naissance,
            'lieu_naissance' => $inscription->lieu_naissance,
            'latitude' => $inscription->latitude,
            'longitude' => $inscription->longitude,
        ]);

        if ($inscription->role === 'livreur') {
            \App\Models\Livreur::create([
                'user_id' => $user->id,
                'points_mensuels' => 0,
                'disponibilite' => false,
            ]);
        }

        if ($inscription->role === 'vendeur') {
            Stand::create([
                'user_id' => $user->id,
                'nom' => $inscription->nom_stand ?: "Stand de {$user->prenom} {$user->nom}",
                'description' => $inscription->description_stand ?: '',
                'localisation' => 'SENFOIRE',
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Compte finalisé avec succès ! Bienvenue sur SENFOIRE.',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'nom' => $user->nom,
                'prenom' => $user->prenom,
                'email' => $user->email,
                'role' => $user->role,
                'telephone' => $user->telephone,
            ],
        ], 201);
    }
}
