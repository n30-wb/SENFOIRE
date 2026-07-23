<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Middleware\RoleMiddleware;

class ProduitController extends Controller
{
    /**
     * Afficher la liste de tous les produits disponibles (Pour le catalogue Client)
     */
    public function index()
    {
        $produits = Produit::with(['stand', 'categorie'])->where('disponibilite', true)->get();

        return response()->json([
            'success' => true,
            'data' => $produits
        ], 200);
    }

    /**
     * Afficher uniquement les produits du vendeur connecté (Pour le dashboard Vendeur)
     */
    public function mesProduits(Request $request)
    {
        $user = $request->user();
        $stand = $user->stand;

        if (!$stand) {
            return response()->json([
                'success' => true,
                'data' => [],
                'message' => 'Aucun stand associé à ce compte vendeur.'
            ], 200);
        }

        $produits = Produit::where('stand_id', $stand->id)->get();

        return response()->json([
            'success' => true,
            'data' => $produits
        ], 200);
    }

    /**
     * Ajouter un nouveau produit (Réservé aux Vendeurs via le middleware)
     */
    public function store(Request $request)
    {
        $user = $request->user();
        $stand = $user->stand;

        if (!$stand) {
            return response()->json([
                'success' => false,
                'message' => 'Aucun stand associé à votre compte. Veuillez d\'abord créer un stand.'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'stock' => 'required|integer|min:0',
            'photos' => 'nullable|array',
            'photos.*' => 'image|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Champs invalides.',
                'errors' => $validator->errors()
            ], 422);
        }

        $photos = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $file) {
                $path = $file->store('produits', 'public');
                $photos[] = $path;
            }
        }

        $produit = Produit::create([
            'stand_id' => $stand->id,
            'categorie_id' => $request->categorie_id,
            'nom' => $request->nom,
            'description' => $request->description,
            'prix' => (float) $request->prix,
            'stock' => (int) $request->stock,
            'disponibilite' => true,
            'photos' => $photos,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Le produit a bien été ajouté !',
            'data' => $produit
        ], 201);
    }

    /**
     * Afficher les détails d'un produit spécifique
     */
    public function show($id)
    {
        $produit = Produit::with(['stand', 'categorie'])->find($id);

        if (!$produit) {
            return response()->json(['success' => false, 'message' => 'Produit introuvable.'], 404);
        }

        return response()->json(['success' => true, 'data' => $produit], 200);
    }

    /**
     * Mettre à jour un produit (Stock, Prix, etc.)
     */
    public function update(Request $request, $id)
    {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json(['success' => false, 'message' => 'Produit introuvable.'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'prix' => 'sometimes|numeric|min:0',
            'stock' => 'sometimes|integer|min:0',
            'disponibilite' => 'sometimes|boolean',
            'photos' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        // Si le stock est mis à jour à 0, on bascule la disponibilité à false automatiquement
        if ($request->has('stock') && $request->stock == 0) {
            $request->merge(['disponibilite' => false]);
        }

        $produit->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Produit mis à jour avec succès.',
            'data' => $produit
        ], 200);
    }

    /**
     * Supprimer un produit
     */
    public function destroy($id)
    {
        $produit = Produit::find($id);

        if (!$produit) {
            return response()->json(['success' => false, 'message' => 'Produit introuvable.'], 404);
        }

        $user = request()->user();

        if ($user->role === 'vendeur') {
            $stand = $user->stand;

            if (!$stand || $produit->stand_id !== $stand->id) {
                return response()->json(['success' => false, 'message' => 'Vous ne pouvez supprimer que vos propres produits.'], 403);
            }
        }

        try {
            $produit->delete();
        } catch (\Illuminate\Database\QueryException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Impossible de supprimer ce produit car il est lié à des commandes existantes.'
            ], 409);
        }

        return response()->json([
            'success' => true,
            'message' => 'Produit supprimé avec succès.'
        ], 200);
    }
}