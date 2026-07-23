<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'password',
        'telephone',
        'pseudo',
        'role',
        'cni',
        'photo_cni',
        'date_naissance',
        'lieu_naissance',
        'latitude',
        'longitude',
        'avatar',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function stand()
    {
        return $this->hasOne(Stand::class);
    }

    public function commandes()
    {
        return $this->hasMany(Commande::class, 'client_id');
    }

    public function livreur()
    {
        return $this->hasOne(Livreur::class);
    }

    public function notifications_app()
    {
        return $this->hasMany(Notification::class);
    }

    public function avis()
    {
        return $this->hasMany(Avi::class, 'client_id');
    }

    public function favoris()
    {
        return $this->hasMany(Favori::class, 'client_id');
    }

    public function conversations()
    {
        return $this->hasMany(Conversation::class, 'client_id');
    }

    public function conversationsVendeur()
    {
        return $this->hasMany(Conversation::class, 'vendeur_id');
    }

    public function messages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

}