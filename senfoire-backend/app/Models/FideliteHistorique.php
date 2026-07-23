<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FideliteHistorique extends Model
{
    protected $table = 'fidelite_historique';

    protected $fillable = [
        'client_id', 'points', 'type', 'description', 'commande_id',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }
}
