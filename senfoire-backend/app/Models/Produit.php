<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Produit extends Model
{
    use HasFactory;
    protected $fillable = ['stand_id', 'categorie_id', 'nom', 'description', 'prix', 'stock', 'disponibilite', 'photos'];

    protected $casts = [
        'photos' => 'array', // Transforme automatiquement le JSON MySQL en tableau PHP
        'disponibilite' => 'boolean',
    ];

    // Ajoute automatiquement le champ virtuel "image" dans chaque réponse JSON
    protected $appends = ['image', 'note_moyenne', 'nombre_avis'];

    public function stand()
    {
        return $this->belongsTo(Stand::class);
    }

    public function categorie()
    {
        return $this->belongsTo(Categorie::class, 'categorie_id');
    }

    public function avis()
    {
        return $this->morphMany(Avi::class, 'avisable');
    }

    public function favoris()
    {
        return $this->hasMany(Favori::class);
    }

    public function getImageAttribute()
    {
        if (!empty($this->photos) && count($this->photos) > 0) {
            return '/storage/' . $this->photos[0];
        }
        return null;
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