<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Stand;
use App\Models\Livreur;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Création de l'Administrateur ESMT
        User::create([
            'nom' => 'Mouhammad Admin',
            'email' => 'admin@senfoire.sn',
            'password' => Hash::make('password123'),
            'telephone' => '771234567',
            'role' => 'admin',
        ]);

        // 2. Création du Vendeur et de son Stand de démonstration
        $vendeur = User::create([
            'nom' => 'Alpha Electronique',
            'email' => 'vendeur@senfoire.sn',
            'password' => Hash::make('password123'),
            'telephone' => '772345678',
            'role' => 'vendeur',
        ]);

        Stand::create([
            'user_id' => $vendeur->id,
            'nom' => 'Guédiawaye Tech Space',
            'description' => 'Boutique spécialisée dans les gadgets et accessoires informatiques de pointe.',
            'logo' => 'https://images.unsplash.com/photo-1531297484001-80022131f5a1',
            'localisation' => 'Pavillon A, Allée 3, Stand 42',
        ]);

        // 3. Création d'un Client de test
        User::create([
            'nom' => 'Fatou Diop',
            'email' => 'client@senfoire.sn',
            'password' => Hash::make('password123'),
            'telephone' => '773456789',
            'role' => 'client',
        ]);

        // 4. Création d'un Livreur avec son profil associé
        $livreurUser = User::create([
            'nom' => 'Ibrahima TiakTiak',
            'email' => 'livreur@senfoire.sn',
            'password' => Hash::make('password123'),
            'telephone' => '774567890',
            'role' => 'livreur',
        ]);

        Livreur::create([
            'user_id' => $livreurUser->id,
            'points_mensuels' => 150, // Déjà quelques points pour la démo visuelle
            'disponibilite' => true,
        ]);
    }
}