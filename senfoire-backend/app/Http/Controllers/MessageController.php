<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\Commande;
use App\Models\Notification;
use App\Models\User;
use App\Events\NewMessageEvent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class MessageController extends Controller
{
    public function conversations(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'admin') {
            $conversations = Conversation::with([
                'client:id,nom,prenom',
                'vendeur:id,nom,prenom',
                'admin:id,nom,prenom',
                'commande:id,montant_total',
                'dernierMessage',
            ])
                ->whereNotNull('admin_id')
                ->latest()
                ->get();
        } else {
            $conversations = Conversation::with([
                'client:id,nom,prenom',
                'vendeur:id,nom,prenom',
                'admin:id,nom,prenom',
                'commande:id,montant_total',
                'dernierMessage',
            ])
                ->where('client_id', $user->id)
                ->orWhere('vendeur_id', $user->id)
                ->orWhere('admin_id', $user->id)
                ->latest()
                ->get();
        }

        return response()->json(['success' => true, 'data' => $conversations]);
    }

    public function messages(Request $request, $conversationId)
    {
        $conversation = Conversation::findOrFail($conversationId);
        $user = $request->user();

        $allowed = $conversation->client_id === $user->id
            || $conversation->vendeur_id === $user->id
            || $conversation->admin_id === $user->id
            || $user->role === 'admin';

        if (!$allowed) {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }

        Message::where('conversation_id', $conversationId)
            ->where('sender_id', '!=', $user->id)
            ->where('lu', false)
            ->update(['lu' => true]);

        $messages = Message::with('sender:id,nom,prenom,role')
            ->where('conversation_id', $conversationId)
            ->oldest()
            ->get();

        return response()->json(['success' => true, 'data' => $messages]);
    }

    public function envoyer(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'commande_id' => 'sometimes|exists:commandes,id',
            'conversation_id' => 'sometimes|exists:conversations,id',
            'contenu' => 'required|string|max:2000',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user = $request->user();
        $conversation = null;

        if ($request->conversation_id) {
            $conversation = Conversation::findOrFail($request->conversation_id);
        } elseif ($request->commande_id) {
            $commande = Commande::with('lignes.produit.stand')->findOrFail($request->commande_id);
            $vendeurId = $commande->lignes->first()?->produit?->stand?->vendeur?->id;
            if (!$vendeurId) {
                return response()->json(['success' => false, 'message' => 'Aucun vendeur associé à cette commande.'], 400);
            }
            $conversation = Conversation::firstOrCreate([
                'commande_id' => $commande->id,
                'client_id' => $commande->client_id,
                'vendeur_id' => $vendeurId,
            ]);
        } else {
            return response()->json(['success' => false, 'message' => 'Spécifiez conversation_id ou commande_id.'], 400);
        }

        $allowed = $conversation->client_id === $user->id
            || $conversation->vendeur_id === $user->id
            || $conversation->admin_id === $user->id
            || $user->role === 'admin';

        if (!$allowed) {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'contenu' => $request->contenu,
        ]);

        if ($conversation->admin_id && $conversation->admin_id === $user->id) {
            $destinataireId = $conversation->client_id;
        } elseif ($conversation->admin_id) {
            $destinataireId = $conversation->admin_id;
        } else {
            $destinataireId = $conversation->client_id === $user->id
                ? $conversation->vendeur_id
                : $conversation->client_id;
        }

        Notification::create([
            'user_id' => $destinataireId,
            'type' => 'nouveau_message',
            'message' => "Nouveau message de {$user->prenom} {$user->nom}",
        ]);

        // Broadcast message in real-time
        broadcast(new NewMessageEvent($message));

        return response()->json(['success' => true, 'data' => $message], 201);
    }

    public function nonLu(Request $request)
    {
        $user = $request->user();
        $count = Conversation::where(function ($q) use ($user) {
            $q->where('client_id', $user->id)
              ->orWhere('vendeur_id', $user->id)
              ->orWhere('admin_id', $user->id);
        })->whereHas('messages', function ($q) use ($user) {
            $q->where('sender_id', '!=', $user->id)->where('lu', false);
        })->count();

        return response()->json(['success' => true, 'non_lu' => $count]);
    }

    public function creerConversationAdmin(Request $request)
    {
        $user = $request->user();

        $admin = User::where('role', 'admin')->first();
        if (!$admin) {
            return response()->json(['success' => false, 'message' => 'Aucun admin trouvé.'], 404);
        }

        $conversation = Conversation::firstOrCreate(
            [
                'client_id' => $user->id,
                'admin_id' => $admin->id,
            ],
            [
                'commande_id' => null,
                'vendeur_id' => null,
                'client_id' => $user->id,
                'admin_id' => $admin->id,
            ]
        );

        return response()->json(['success' => true, 'data' => $conversation]);
    }
}
