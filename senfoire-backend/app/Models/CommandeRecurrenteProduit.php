<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CommandeRecurrenteProduit extends Model
{
    protected $fillable = [
        'commande_recurrente_id', 'produit_id', 'quantite',
    ];

    public function commandeRecurrente()
    {
        return $this->belongsTo(CommandeRecurrente::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
