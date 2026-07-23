<?php

namespace Database\Factories;

use App\Models\Stand;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class StandFactory extends Factory
{
    protected $model = Stand::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'nom' => fake()->company(),
            'description' => fake()->sentence(),
            'localisation' => 'Dakar, Sénégal',
        ];
    }
}
