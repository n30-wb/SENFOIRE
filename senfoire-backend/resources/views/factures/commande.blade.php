<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Facture #{{ $commande->id }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 24px; color: #1e3a8a; margin: 0; }
        .header p { color: #666; margin: 5px 0 0; }
        .infos { margin-bottom: 20px; }
        .infos table { width: 100%; }
        .infos td { padding: 4px 0; }
        .infos .label { font-weight: bold; color: #555; width: 150px; }
        table.details { width: 100%; border-collapse: collapse; margin: 20px 0; }
        table.details th { background: #1e3a8a; color: white; padding: 10px; text-align: left; font-size: 11px; }
        table.details td { padding: 10px; border-bottom: 1px solid #eee; }
        table.details tr:nth-child(even) { background: #f9f9f9; }
        .total { text-align: right; margin-top: 10px; font-size: 14px; }
        .total strong { font-size: 18px; color: #1e3a8a; }
        .footer { text-align: center; margin-top: 40px; color: #999; font-size: 10px; border-top: 1px solid #eee; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>SENFOIRE</h1>
        <p>Foire Internationale Virtuelle</p>
        <h2 style="margin-top: 20px;">FACTURE #{{ $commande->id }}</h2>
    </div>

    <div class="infos">
        <table>
            <tr><td class="label">Client :</td><td>{{ $commande->client->prenom }} {{ $commande->client->nom }}</td></tr>
            <tr><td class="label">Email :</td><td>{{ $commande->client->email }}</td></tr>
            <tr><td class="label">Téléphone :</td><td>{{ $commande->client->telephone }}</td></tr>
            <tr><td class="label">Date :</td><td>{{ $commande->created_at->format('d/m/Y H:i') }}</td></tr>
            <tr><td class="label">Paiement :</td><td>{{ $commande->mode_paiement }}</td></tr>
            <tr><td class="label">Statut :</td><td>{{ ucfirst(str_replace('_', ' ', $commande->statut)) }}</td></tr>
        </table>
    </div>

    <table class="details">
        <thead>
            <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix unitaire</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($commande->lignes as $ligne)
            <tr>
                <td>{{ $ligne->produit->nom }}</td>
                <td>{{ $ligne->quantite }}</td>
                <td>{{ number_format($ligne->produit->prix, 0, ',', ' ') }} FCFA</td>
                <td>{{ number_format($ligne->produit->prix * $ligne->quantite, 0, ',', ' ') }} FCFA</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="total">
        @if($commande->montant_reduction > 0)
            <p>Sous-total : {{ number_format($commande->montant_total, 0, ',', ' ') }} FCFA</p>
            <p>Réduction : -{{ number_format($commande->montant_reduction, 0, ',', ' ') }} FCFA</p>
        @endif
        <p>Livraison : {{ number_format($commande->prix_livraison ?? 0, 0, ',', ' ') }} FCFA</p>
        <p><strong>Total : {{ number_format(($commande->montant_total + ($commande->prix_livraison ?? 0) - $commande->montant_reduction), 0, ',', ' ') }} FCFA</strong></p>
    </div>

    <div class="footer">
        <p>SENFOIRE - Merci de votre confiance !</p>
        <p>{{ date('Y') }} SENFOIRE. Tous droits réservés.</p>
    </div>
</body>
</html>
