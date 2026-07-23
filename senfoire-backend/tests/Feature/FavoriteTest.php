<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Produit;
use App\Models\Stand;
use Illuminate\Foundation\Testing\RefreshDatabase;

class FavoriteTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_toggle_favorite()
    {
        $client = User::factory()->create(['role' => 'client']);
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $stand = Stand::factory()->create(['user_id' => $vendeur->id]);
        $produit = Produit::factory()->create(['stand_id' => $stand->id]);

        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/favoris/toggle', ['produit_id' => $produit->id]);

        $response->assertStatus(201)
            ->assertJson(['favori' => true]);
    }
}
