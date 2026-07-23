<?php

namespace App\Http\Controllers;

use App\Models\Categorie;
use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategorieController extends Controller
{
    public function index()
    {
        $categories = Categorie::withCount('produits')->get();
        return response()->json(['success' => true, 'data' => $categories]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $categorie = Categorie::create([
            'nom' => $request->nom,
            'slug' => Str::slug($request->nom),
            'description' => $request->description,
            'image' => $request->image,
        ]);

        return response()->json(['success' => true, 'data' => $categorie], 201);
    }

    public function show($id)
    {
        $categorie = Categorie::with('produits')->findOrFail($id);
        return response()->json(['success' => true, 'data' => $categorie]);
    }

    public function update(Request $request, $id)
    {
        $categorie = Categorie::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string',
            'est_active' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        if ($request->has('nom')) {
            $categorie->nom = $request->nom;
            $categorie->slug = Str::slug($request->nom);
        }
        if ($request->has('description')) $categorie->description = $request->description;
        if ($request->has('image')) $categorie->image = $request->image;
        if ($request->has('est_active')) $categorie->est_active = $request->est_active;
        $categorie->save();

        return response()->json(['success' => true, 'data' => $categorie]);
    }

    public function destroy($id)
    {
        $categorie = Categorie::findOrFail($id);
        Produit::where('categorie_id', $id)->update(['categorie_id' => null]);
        $categorie->delete();
        return response()->json(['success' => true, 'message' => 'Catégorie supprimée.']);
    }
}
