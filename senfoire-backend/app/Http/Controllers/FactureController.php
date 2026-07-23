<?php

namespace App\Http\Controllers;

use App\Models\Commande;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    public function telecharger(Request $request, $commandeId)
    {
        $commande = Commande::with([
            'client:id,nom,prenom,email,telephone',
            'lignes.produit',
            'livraison.livreur.user',
            'paiement',
        ])->findOrFail($commandeId);

        $user = $request->user();
        if ($user->role !== 'admin' && $commande->client_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Accès refusé.'], 403);
        }

        $pdf = Pdf::loadView('factures.commande', ['commande' => $commande])
            ->setPaper('a4', 'portrait');

        return $pdf->download("facture_{$commande->id}.pdf");
    }
}
