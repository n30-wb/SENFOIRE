<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Paiement extends Model
{
    protected $fillable = ['commande_id', 'montant', 'part_vendeur', 'part_commission', 'reference_prestataire', 'statut'];

    // Le paiement est lié à une commande unique
    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }
}