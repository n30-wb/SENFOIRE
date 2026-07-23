<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CommandeRecurrente extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id', 'frequence', 'prochaine_commande', 'active',
    ];

    protected $casts = [
        'prochaine_commande' => 'date',
        'active' => 'boolean',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function produits()
    {
        return $this->belongsToMany(Produit::class, 'commande_recurrente_produits')
            ->withPivot('quantite');
    }
}
