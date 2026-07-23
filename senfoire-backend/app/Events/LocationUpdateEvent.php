<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LocationUpdateEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public int $livreurId;
    public float $latitude;
    public float $longitude;
    public int $commandeId;

    public function __construct(int $livreurId, float $latitude, float $longitude, int $commandeId)
    {
        $this->livreurId = $livreurId;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->commandeId = $commandeId;
    }

    public function broadcastOn(): array
    {
        return [
            new \Illuminate\Broadcasting\Channel('livreur-location.' . $this->commandeId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'location.update';
    }

    public function broadcastWith(): array
    {
        return [
            'livreur_id' => $this->livreurId,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'commande_id' => $this->commandeId,
        ];
    }
}
