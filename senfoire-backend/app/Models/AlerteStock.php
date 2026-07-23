<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlerteStock extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'produit_id', 'declenchee', 'declenchee_at',
    ];

    protected $casts = [
        'declenchee' => 'boolean',
        'declenchee_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function produit()
    {
        return $this->belongsTo(Produit::class);
    }
}
