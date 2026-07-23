<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Conversation;
use Illuminate\Foundation\Testing\RefreshDatabase;

class MessageTest extends TestCase
{
    use RefreshDatabase;

    public function test_client_can_send_message()
    {
        $client = User::factory()->create(['role' => 'client']);
        $vendeur = User::factory()->create(['role' => 'vendeur']);
        $token = $client->createToken('test')->plainTextToken;

        $conv = Conversation::create([
            'client_id' => $client->id,
            'vendeur_id' => $vendeur->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/messages/envoyer', [
                'conversation_id' => $conv->id,
                'contenu' => 'Bonjour, j\'ai une question.',
            ]);

        $response->assertStatus(201)
            ->assertJson(['success' => true]);
    }
}
