<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('conversation.{id}', function ($user, $id) {
    $conversation = \App\Models\Conversation::find($id);
    if (!$conversation) return false;

    return $user->id === $conversation->client_id
        || $user->id === $conversation->vendeur_id
        || $user->id === $conversation->admin_id
        || $user->role === 'admin';
});

Broadcast::channel('livreur-location.{commandeId}', function ($user, $commandeId) {
    $commande = \App\Models\Commande::find($commandeId);
    if (!$commande) return false;

    return $user->id === $commande->client_id || $user->role === 'admin';
});

Broadcast::channel('commande.{id}', function ($user, $id) {
    $commande = \App\Models\Commande::find($id);
    if (!$commande) return false;

    return $user->id === $commande->client_id || $user->role === 'admin' || $user->role === 'caissier';
});

Broadcast::channel('user.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
