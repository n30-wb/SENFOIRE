<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Categorie;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CategoryTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_category()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $token = $admin->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/categories', [
                'nom' => 'Électronique',
                'description' => 'Produits électroniques',
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }

    public function test_public_can_view_categories()
    {
        Categorie::create(['nom' => 'Mode', 'slug' => 'mode']);

        $response = $this->getJson('/api/categories');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data');
    }
}
