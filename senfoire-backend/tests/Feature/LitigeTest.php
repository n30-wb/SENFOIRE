<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Commande;
use App\Models\Produit;
use App\Models\Stand;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LitigeTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_open_litige()
    {
        $client = User::factory()->create(['role' => 'client']);
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $stand = Stand::factory()->create(['user_id' => $vendeur->id]);
        $produit = Produit::factory()->create(['stand_id' => $stand->id]);
        $commande = Commande::factory()->create(['client_id' => $client->id]);

        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/litiges', [
                'commande_id' => $commande->id,
                'type' => 'produit_non_conforme',
                'description' => 'Produit défectueux reçu.',
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }
}
