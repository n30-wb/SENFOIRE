<?php
// Litige feature removed - no longer used

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Litige extends Model
{
    protected $fillable = [
        'commande_id', 'client_id', 'vendeur_id', 'type', 'description',
        'statut', 'resolution', 'decision', 'montant_rembourse',
        'resolu_par', 'resolu_le',
    ];

    protected $casts = [
        'montant_rembourse' => 'float',
        'resolu_le' => 'datetime',
    ];

    public function commande()
    {
        return $this->belongsTo(Commande::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function vendeur()
    {
        return $this->belongsTo(User::class, 'vendeur_id');
    }

    public function resoluPar()
    {
        return $this->belongsTo(User::class, 'resolu_par');
    }
}
