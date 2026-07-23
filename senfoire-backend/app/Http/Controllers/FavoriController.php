<?php

namespace App\Http\Controllers;

use App\Models\Favori;
use Illuminate\Http\Request;

class FavoriController extends Controller
{
    public function index(Request $request)
    {
        $favoris = Favori::with('produit.stand')
            ->where('client_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $favoris]);
    }

    public function toggle(Request $request)
    {
        $request->validate(['produit_id' => 'required|exists:produits,id']);

        $existant = Favori::where('client_id', $request->user()->id)
            ->where('produit_id', $request->produit_id)
            ->first();

        if ($existant) {
            $existant->delete();
            return response()->json(['success' => true, 'favori' => false, 'message' => 'Retiré des favoris.']);
        }

        $favori = Favori::create([
            'client_id' => $request->user()->id,
            'produit_id' => $request->produit_id,
        ]);

        return response()->json(['success' => true, 'favori' => true, 'data' => $favori], 201);
    }

    public function check(Request $request, $produitId)
    {
        $existe = Favori::where('client_id', $request->user()->id)
            ->where('produit_id', $produitId)
            ->exists();

        return response()->json(['success' => true, 'favori' => $existe]);
    }
}
