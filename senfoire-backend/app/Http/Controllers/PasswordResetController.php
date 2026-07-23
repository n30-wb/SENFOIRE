<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Mail\PasswordResetCodeMail;

class PasswordResetController extends Controller
{
    public function envoyerCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = User::where('email', $request->email)->first();
        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['email' => $user->email, 'token' => Hash::make($code), 'created_at' => now()]
        );

        Mail::to($user->email)->send(new PasswordResetCodeMail($user, $code));

        return response()->json([
            'success' => true,
            'message' => 'Un code de réinitialisation a été envoyé à votre email.',
        ]);
    }

    public function verifierCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->code, $record->token)) {
            return response()->json(['success' => false, 'message' => 'Code invalide.'], 400);
        }

        if (now()->diffInMinutes($record->created_at) > 30) {
            return response()->json(['success' => false, 'message' => 'Code expiré.'], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Code valide.',
            'reset_token' => $record->token,
        ]);
    }

    public function reinitialiser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'code' => 'required|string|size:6',
            'password' => 'required|string|min:6|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !Hash::check($request->code, $record->token)) {
            return response()->json(['success' => false, 'message' => 'Code invalide.'], 400);
        }

        if (now()->diffInMinutes($record->created_at) > 30) {
            return response()->json(['success' => false, 'message' => 'Code expiré.'], 400);
        }

        $user = User::where('email', $request->email)->first();
        $user->update(['password' => Hash::make($request->password)]);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe réinitialisé avec succès.',
        ]);
    }
}
