<?php

namespace App\Http\Controllers;

use App\Models\Avi;
use App\Models\Produit;
use App\Models\Stand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AviController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'note' => 'required|integer|min:1|max:5',
            'commentaire' => 'nullable|string|max:1000',
            'avisable_type' => 'required|string|in:produit,stand',
            'avisable_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $modelClass = $request->avisable_type === 'produit' ? Produit::class : Stand::class;
        $avisable = $modelClass::findOrFail($request->avisable_id);

        $existant = Avi::where('client_id', $request->user()->id)
            ->where('avisable_type', $modelClass)
            ->where('avisable_id', $request->avisable_id)
            ->first();

        if ($existant) {
            $existant->update([
                'note' => $request->note,
                'commentaire' => $request->commentaire,
            ]);
            return response()->json(['success' => true, 'data' => $existant, 'message' => 'Avis mis à jour.']);
        }

        $avi = Avi::create([
            'client_id' => $request->user()->id,
            'avisable_type' => $modelClass,
            'avisable_id' => $request->avisable_id,
            'note' => $request->note,
            'commentaire' => $request->commentaire,
        ]);

        return response()->json(['success' => true, 'data' => $avi], 201);
    }

    public function produit($id)
    {
        $produit = Produit::findOrFail($id);
        $avis = Avi::with('client:id,nom,prenom')
            ->where('avisable_type', Produit::class)
            ->where('avisable_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $avis,
            'moyenne' => round($produit->avis()->avg('note') ?? 0, 1),
            'total' => $produit->avis()->count(),
        ]);
    }

    public function stand($id)
    {
        $stand = Stand::findOrFail($id);
        $avis = Avi::with('client:id,nom,prenom')
            ->where('avisable_type', Stand::class)
            ->where('avisable_id', $id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $avis,
            'moyenne' => round($stand->avis()->avg('note') ?? 0, 1),
            'total' => $stand->avis()->count(),
        ]);
    }

    public function destroy($id)
    {
        $avi = Avi::findOrFail($id);
        $avi->delete();
        return response()->json(['success' => true, 'message' => 'Avis supprimé.']);
    }
}
