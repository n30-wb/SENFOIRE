<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register()
    {
        $response = $this->postJson('/api/register', [
            'nom' => 'Test',
            'prenom' => 'User',
            'email' => 'test@test.sn',
            'telephone' => '771234567',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'client',
        ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }

    public function test_user_can_login()
    {
        User::factory()->create([
            'email' => 'test@test.sn',
            'password' => bcrypt('password'),
            'role' => 'client',
        ]);

        $response = $this->postJson('/api/login', [
            'identifiant' => 'test@test.sn',
            'password' => 'password',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user']);
    }
}
