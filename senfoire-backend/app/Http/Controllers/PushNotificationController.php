<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PushNotificationController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'endpoint' => 'required|string',
            'public_key' => 'required|string',
            'auth_token' => 'required|string',
            'p256dh_key' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();

        // Upsert to avoid duplicates
        PushSubscription::updateOrCreate(
            ['user_id' => $user->id, 'endpoint' => $request->endpoint],
            [
                'public_key' => $request->public_key,
                'auth_token' => $request->auth_token,
                'p256dh_key' => $request->p256dh_key,
            ]
        );

        return response()->json(['success' => true, 'message' => 'Abonnement push enregistré.']);
    }

    public function destroy(Request $request)
    {
        $user = $request->user();
        PushSubscription::where('user_id', $user->id)->where('endpoint', $request->endpoint)->delete();
        return response()->json(['success' => true, 'message' => 'Abonnement push supprimé.']);
    }

    public function index(Request $request)
    {
        $subscriptions = PushSubscription::where('user_id', $request->user()->id)->get();
        return response()->json(['success' => true, 'data' => $subscriptions]);
    }
}
