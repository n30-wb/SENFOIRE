<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LigneDeCommande extends Model
{
    protected $table = 'ligne_de_commandes'; // Forcer le nom exact de la table
    
    protected $fillable = ['commande_id', 'produit_id', 'quantite', 'recommandation'];

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}