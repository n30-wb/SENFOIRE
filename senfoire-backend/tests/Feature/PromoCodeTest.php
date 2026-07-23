<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\PromoCode;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PromoCodeTest extends TestCase
{
    use RefreshDatabase;

    public function test_validate_promo_code()
    {
        $client = User::factory()->create(['role' => 'client']);
        $token = $client->createToken('test')->plainTextToken;

        PromoCode::create([
            'code' => 'SENFOIRE10',
            'type' => 'pourcentage',
            'valeur' => 10,
            'est_actif' => true,
        ]);

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/promo/valider', [
                'code' => 'SENFOIRE10',
                'montant_commande' => 10000,
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.reduction', 1000);
    }
}
