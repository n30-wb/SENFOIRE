<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commande extends Model
{
    use HasFactory;
    protected $fillable = [
        'client_id', 'statut', 'montant_total', 'montant_commission', 'mode_paiement',
        'promo_code_id', 'montant_reduction', 'montant_total_apres_reduction',
        'prix_livraison', 'distance_km', 'valide_caissier', 'fidelite_points_used',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function lignes()
    {
        return $this->hasMany(LigneDeCommande::class);
    }

    public function paiement()
    {
        return $this->hasOne(Paiement::class);
    }

    public function livraison()
    {
        return $this->hasOne(Livraison::class);
    }

    public function promoCode()
    {
        return $this->belongsTo(PromoCode::class);
    }

    // Litige feature removed - no longer used

    public function conversation()
    {
        return $this->hasOne(Conversation::class);
    }
}