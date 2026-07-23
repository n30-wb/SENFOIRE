<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class PaiementInfoController extends Controller
{
    public function index()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'wave' => [
                    'numero' => env('WAVE_NUMERO', '221xxxxxxxxx'),
                    'nom' => 'SENFOIRE',
                    'lien' => env('WAVE_LIEN_PAIEMENT', 'https://pay.wave.com/m/M_sn_-MG5n435uu_e/c/sn/'),
                ],
                'orange_money' => [
                    'numero' => env('ORANGE_MONEY_NUMERO', '221xxxxxxxxx'),
                    'nom' => 'SENFOIRE',
                    'lien' => null,
                ],
            ],
        ]);
    }
}
