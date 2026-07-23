<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Stand extends Model
{
    use HasFactory;
    protected $fillable = ['user_id', 'nom', 'description', 'logo', 'localisation', 'latitude', 'longitude'];

    protected $casts = [
        'latitude' => 'float',
        'longitude' => 'float',
    ];

    public function vendeur()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function produits()
    {
        return $this->hasMany(Produit::class);
    }

    public function avis()
    {
        return $this->morphMany(Avi::class, 'avisable');
    }

    public function getNoteMoyenneAttribute()
    {
        return $this->avis()->avg('note');
    }

    public function getNombreAvisAttribute()
    {
        return $this->avis()->count();
    }
}