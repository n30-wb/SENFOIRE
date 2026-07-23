<?php

namespace Database\Factories;

use App\Models\Produit;
use App\Models\Stand;
use Illuminate\Database\Eloquent\Factories\Factory;

class ProduitFactory extends Factory
{
    protected $model = Produit::class;

    public function definition(): array
    {
        return [
            'stand_id' => Stand::factory(),
            'nom' => fake()->word(),
            'description' => fake()->sentence(),
            'prix' => fake()->randomFloat(2, 500, 100000),
            'stock' => fake()->numberBetween(0, 100),
            'disponibilite' => true,
        ];
    }
}
