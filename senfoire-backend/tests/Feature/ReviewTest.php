<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Produit;
use App\Models\Stand;
use App\Models\Avi;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_review_product()
    {
        $client = User::factory()->create(['role' => 'client']);
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $stand = Stand::factory()->create(['user_id' => $vendeur->id]);
        $produit = Produit::factory()->create(['stand_id' => $stand->id]);

        $token = $client->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/avis', [
                'note' => 5,
                'commentaire' => 'Excellent produit !',
                'avisable_type' => 'produit',
                'avisable_id' => $produit->id,
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }

    public function test_product_reviews_are_visible()
    {
        $produit = Produit::factory()->create();
        $client = User::factory()->create(['role' => 'client']);
        Avi::create([
            'client_id' => $client->id,
            'avisable_type' => Produit::class,
            'avisable_id' => $produit->id,
            'note' => 4,
            'commentaire' => 'Bon produit',
        ]);

        $response = $this->getJson("/api/avis/produit/{$produit->id}");

        $response->assertStatus(200)
            ->assertJsonPath('moyenne', 4);
    }
}
