<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Livraison extends Model
{
    protected $fillable = ['commande_id', 'livreur_id', 'statut', 'date_livraison', 'prix_livraison', 'distance_km'];

    protected $casts = [
        'date_livraison' => 'datetime',
    ];

    // La livraison est liée à une commande
    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    // La livraison est prise en charge par un livreur
    public function livreur()
    {
        return $this->belongsTo(Livreur::class);
    }
}