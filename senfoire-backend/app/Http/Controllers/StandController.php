<?php

namespace App\Http\Controllers;

use App\Models\Stand;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class StandController extends Controller
{
    public function monStand(Request $request)
    {
        $stand = Stand::where('user_id', $request->user()->id)->first();

        if (!$stand) {
            return response()->json(['success' => true, 'data' => null]);
        }

        return response()->json(['success' => true, 'data' => $stand]);
    }

    public function store(Request $request)
    {
        $existing = Stand::where('user_id', $request->user()->id)->first();
        if ($existing) {
            return response()->json(['success' => true, 'data' => $existing]);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'required|string|max:255',
            'description' => 'nullable|string',
            'localisation' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();
        $data['user_id'] = $request->user()->id;

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('stands', 'public');
        }

        $stand = Stand::create($data);

        return response()->json(['success' => true, 'data' => $stand], 201);
    }

    public function update(Request $request, $id)
    {
        $stand = Stand::findOrFail($id);

        if ($stand->user_id !== $request->user()->id && $request->user()->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }

        $validator = Validator::make($request->all(), [
            'nom' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'localisation' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $data = $validator->validated();

        if ($request->hasFile('logo')) {
            if ($stand->logo && Storage::disk('public')->exists($stand->logo)) {
                Storage::disk('public')->delete($stand->logo);
            }
            $data['logo'] = $request->file('logo')->store('stands', 'public');
        }

        $stand->update($data);

        return response()->json(['success' => true, 'data' => $stand]);
    }
}
