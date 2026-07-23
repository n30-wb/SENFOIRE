<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Categorie extends Model
{
    protected $fillable = ['nom', 'slug', 'description', 'image', 'est_active'];

    protected $casts = [
        'est_active' => 'boolean',
    ];

    public function produits()
    {
        return $this->hasMany(Produit::class, 'categorie_id');
    }
}
