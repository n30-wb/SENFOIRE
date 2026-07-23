<?php

namespace Database\Factories;

use App\Models\Commande;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CommandeFactory extends Factory
{
    protected $model = Commande::class;

    public function definition(): array
    {
        return [
            'client_id' => User::factory(),
            'statut' => 'en_attente',
            'montant_total' => fake()->randomFloat(2, 1000, 50000),
            'montant_commission' => fake()->randomFloat(2, 50, 2500),
            'mode_paiement' => fake()->randomElement(['Wave', 'Orange Money']),
        ];
    }
}
