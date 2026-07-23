<?php

namespace App\Http\Controllers;

use App\Models\PromoCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PromoCodeController extends Controller
{
    public function index()
    {
        $promos = PromoCode::with('stand:id,nom')->latest()->get();
        return response()->json(['success' => true, 'data' => $promos]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:promo_codes',
            'type' => 'required|in:pourcentage,montant_fixe',
            'valeur' => 'required|numeric|min:0',
            'montant_min_commande' => 'nullable|numeric|min:0',
            'utilisation_max' => 'nullable|integer|min:1',
            'stand_id' => 'nullable|exists:stands,id',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'est_actif' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            $errors = [];
            foreach ($validator->errors()->toArray() as $field => $messages) {
                $fieldFr = match($field) {
                    'code' => 'code',
                    'type' => 'type',
                    'valeur' => 'valeur',
                    default => $field,
                };
                $errors[$fieldFr] = [str_replace('The ' . $field . ' field', $fieldFr, $messages[0])];
            }
            return response()->json(['success' => false, 'message' => 'Erreur de validation', 'errors' => $errors], 422);
        }

        $validated = $validator->validated();
        $validated['est_actif'] = $request->boolean('est_actif', true);

        $promo = PromoCode::create($validated);
        return response()->json(['success' => true, 'data' => $promo], 201);
    }

    public function update(Request $request, $id)
    {
        $promo = PromoCode::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'code' => 'sometimes|string|max:50|unique:promo_codes,code,' . $id,
            'type' => 'sometimes|in:pourcentage,montant_fixe',
            'valeur' => 'sometimes|numeric|min:0',
            'montant_min_commande' => 'nullable|numeric|min:0',
            'utilisation_max' => 'nullable|integer|min:1',
            'date_debut' => 'nullable|date',
            'date_fin' => 'nullable|date',
            'est_actif' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $validated = $validator->validated();
        if ($request->has('est_actif')) {
            $validated['est_actif'] = $request->boolean('est_actif');
        }

        $promo->update($validated);
        return response()->json(['success' => true, 'data' => $promo]);
    }

    public function valider(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'code' => 'required|string',
            'montant_commande' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $promo = PromoCode::where('code', $request->code)->first();

        if (!$promo || !$promo->estValide()) {
            return response()->json(['success' => false, 'message' => 'Code promo invalide ou expiré.'], 400);
        }

        if ($request->montant_commande < $promo->montant_min_commande) {
            return response()->json([
                'success' => false,
                'message' => 'Montant minimum de commande : ' . number_format($promo->montant_min_commande, 0, ',', ' ') . ' FCFA.',
            ], 400);
        }

        $reduction = $promo->type === 'pourcentage'
            ? ($request->montant_commande * $promo->valeur / 100)
            : $promo->valeur;

        $montant_final = max(0, $request->montant_commande - $reduction);

        return response()->json([
            'success' => true,
            'data' => [
                'promo' => $promo,
                'reduction' => round($reduction, 2),
                'montant_initial' => $request->montant_commande,
                'montant_final' => round($montant_final, 2),
            ]
        ]);
    }

    public function destroy($id)
    {
        $promo = PromoCode::findOrFail($id);
        $promo->delete();
        return response()->json(['success' => true, 'message' => 'Code promo supprimé.']);
    }
}
