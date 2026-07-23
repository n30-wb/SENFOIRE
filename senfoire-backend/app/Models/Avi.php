<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Avi extends Model
{
    protected $fillable = ['client_id', 'avisable_type', 'avisable_id', 'note', 'commentaire'];

    protected $casts = [
        'note' => 'integer',
    ];

    protected $table = 'avis';

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function avisable()
    {
        return $this->morphTo();
    }
}
