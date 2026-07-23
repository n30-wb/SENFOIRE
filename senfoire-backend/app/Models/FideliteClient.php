<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FideliteClient extends Model
{
    use HasFactory;

    protected $fillable = [
        'client_id', 'points', 'total_points_gagnes', 'niveau',
    ];

    protected $casts = [
        'points' => 'integer',
        'total_points_gagnes' => 'integer',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function historiques()
    {
        return $this->hasMany(FideliteHistorique::class, 'client_id');
    }
}
