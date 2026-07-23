<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PromoCode extends Model
{
    protected $fillable = [
        'code', 'type', 'valeur', 'montant_min_commande',
        'utilisation_max', 'utilisation_count', 'stand_id',
        'date_debut', 'date_fin', 'est_actif',
    ];

    protected $casts = [
        'valeur' => 'float',
        'montant_min_commande' => 'float',
        'utilisation_max' => 'integer',
        'utilisation_count' => 'integer',
        'est_actif' => 'boolean',
        'date_debut' => 'datetime',
        'date_fin' => 'datetime',
    ];

    protected $table = 'promo_codes';

    public function stand()
    {
        return $this->belongsTo(Stand::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class);
    }

    public function estValide(): bool
    {
        if (!$this->est_actif) return false;
        if ($this->date_fin && now()->toDateString() > $this->date_fin->toDateString()) return false;
        if ($this->date_debut && now()->toDateString() < $this->date_debut->toDateString()) return false;
        if ($this->utilisation_max && $this->utilisation_count >= $this->utilisation_max) return false;
        return true;
    }
}
