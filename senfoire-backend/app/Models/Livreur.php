<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Livreur extends Model
{
    protected $fillable = ['user_id', 'points_mensuels', 'disponibilite'];

    protected $casts = [
        'disponibilite' => 'boolean',
    ];

    // Le profil livreur appartient à un utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Un livreur peut effectuer plusieurs livraisons
    public function livraisons()
    {
        return $this->hasMany(Livraison::class);
    }
}