<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>SENFOIRE - Réinitialisation de mot de passe</h2>
    <p>Bonjour {{ $userName }},</p>
    <p>Voici votre code de réinitialisation :</p>
    <h1 style="background: #f3f4f6; padding: 15px; text-align: center; letter-spacing: 8px; font-size: 32px;">{{ $code }}</h1>
    <p>Ce code expire dans 30 minutes.</p>
    <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
</body>
</html>
