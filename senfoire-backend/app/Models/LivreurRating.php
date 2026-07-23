<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LivreurRating extends Model
{
    protected $fillable = ['livraison_id', 'client_id', 'livreur_id', 'note', 'commentaire'];

    public function livraison()
    {
        return $this->belongsTo(Livraison::class);
    }

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function livreur()
    {
        return $this->belongsTo(Livreur::class);
    }
}
