<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inscription extends Model
{
    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'pseudo',
        'password',
        'role',
        'cni',
        'photo_cni',
        'date_naissance',
        'lieu_naissance',
        'statut',
        'motif_rejet',
        'nom_stand',
        'description_stand',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'date_naissance' => 'date',
        ];
    }
}
