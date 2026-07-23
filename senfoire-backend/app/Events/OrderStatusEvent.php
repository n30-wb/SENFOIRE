<?php

namespace App\Events;

use App\Models\Commande;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Commande $commande;
    public string $statut;

    public function __construct(Commande $commande, string $statut)
    {
        $this->commande = $commande;
        $this->statut = $statut;
    }

    public function broadcastOn(): array
    {
        return [
            new \Illuminate\Broadcasting\Channel('commande.' . $this->commande->id),
            new \Illuminate\Broadcasting\Channel('user.' . $this->commande->client_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'commande.statut';
    }

    public function broadcastWith(): array
    {
        return [
            'commande_id' => $this->commande->id,
            'statut' => $this->statut,
            'montant_total' => $this->commande->montant_total,
            'updated_at' => $this->commande->updated_at,
        ];
    }
}
