<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Retour extends Model
{
    use HasFactory;

    protected $fillable = [
        'commande_id', 'client_id', 'produit_id', 'quantite', 'motif',
        'description', 'statut', 'montant_remboursement', 'decision_admin',
    ];

    protected $casts = [
        'montant_remboursement' => 'decimal:2',
        'quantite' => 'integer',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
