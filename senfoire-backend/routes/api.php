<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\CommandeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LivreurController;
use App\Http\Controllers\InscriptionController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\CategorieController;
use App\Http\Controllers\AviController;
use App\Http\Controllers\FavoriController;
use App\Http\Controllers\PromoCodeController;
use App\Http\Controllers\MessageController;

use App\Http\Controllers\StandController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\CaissierController;
use App\Http\Controllers\PaiementInfoController;
use App\Http\Controllers\PushNotificationController;
use App\Http\Controllers\AlerteStockController;
use App\Http\Controllers\CommandeRecurrenteController;
use App\Http\Controllers\FideliteController;
use App\Http\Controllers\RetourController;
use App\Http\Controllers\VendeurStatsController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// --- ROUTES PUBLIQUES ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/produits', [ProduitController::class, 'index']);
Route::get('/produits/{id}', [ProduitController::class, 'show']);

// Reset mot de passe
Route::post('/password/email', [PasswordResetController::class, 'envoyerCode']);
Route::post('/password/verify', [PasswordResetController::class, 'verifierCode']);
Route::post('/password/reset', [PasswordResetController::class, 'reinitialiser']);

// Inscriptions publiques
Route::post('/inscriptions', [InscriptionController::class, 'store']);
Route::get('/inscriptions/{id}/statut', [InscriptionController::class, 'checkStatut']);
Route::post('/inscriptions/{id}/finaliser', [InscriptionController::class, 'finaliserCompte']);

// --- ROUTES PROTÉGÉES (Token Sanctum Obligatoire) ---
Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/me', function (\Illuminate\Http\Request $request) {
        $user = $request->user();
        return response()->json([
            'id' => $user->id,
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'email' => $user->email,
            'role' => $user->role,
            'telephone' => $user->telephone,
            'pseudo' => $user->pseudo,
        ]);
    });

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('/notifications/{id}/lu', [NotificationController::class, 'markAsRead']);
    Route::post('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Géolocalisation
    Route::put('/location', [LocationController::class, 'update']);
    Route::get('/location/{userId}', [LocationController::class, 'getLocation']);
    Route::get('/commande/{commandeId}/livreur-location', [LocationController::class, 'getLivreurLocation']);

    // Produits du vendeur connecté (pour le dashboard vendeur)
    Route::get('/mes-produits', [ProduitController::class, 'mesProduits']);

    // Catégories
    Route::get('/categories', [CategorieController::class, 'index']);
    Route::get('/categories/{id}', [CategorieController::class, 'show']);

    // Avis (public)
    Route::get('/avis/produit/{id}', [AviController::class, 'produit']);
    Route::get('/avis/stand/{id}', [AviController::class, 'stand']);

    // Favoris
    Route::get('/favoris', [FavoriController::class, 'index']);
    Route::post('/favoris/toggle', [FavoriController::class, 'toggle']);
    Route::get('/favoris/check/{produitId}', [FavoriController::class, 'check']);

    // Infos paiement (numéros Wave/OM admin)
    Route::get('/infos-paiement', [PaiementInfoController::class, 'index']);

    // Validation code promo
    Route::post('/promo/valider', [PromoCodeController::class, 'valider']);

    // Messagerie
    Route::get('/conversations', [MessageController::class, 'conversations']);
    Route::get('/conversations/{id}/messages', [MessageController::class, 'messages']);
    Route::post('/messages/envoyer', [MessageController::class, 'envoyer']);
    Route::get('/messages/non-lu', [MessageController::class, 'nonLu']);
    Route::post('/conversations/admin', [MessageController::class, 'creerConversationAdmin']);


    // Notation livreur
    Route::post('/livraisons/{id}/noter', [LivreurController::class, 'noterLivraison']);

    // Facture PDF
    Route::get('/commandes/{commandeId}/facture', [FactureController::class, 'telecharger']);

    // Avis (client uniquement)
    Route::middleware('role:client')->group(function () {
        Route::post('/avis', [AviController::class, 'store']);
        Route::delete('/avis/{id}', [AviController::class, 'destroy']);
    });

    // --- INTERFACE CLIENT : Gestion des achats ---
    Route::middleware('role:client')->group(function () {
        Route::post('/commandes', [CommandeController::class, 'store']);
    });

    // --- ACCÈS CONSULTATION : Historique pour Clients, Vendeurs & Admin ---
    Route::middleware('role:client,vendeur,admin')->group(function () {
        Route::get('/mes-commandes', [CommandeController::class, 'mesCommandes']);
    });

    // --- INTERFACE VENDEUR & ADMIN : Gestion du catalogue ---
    Route::middleware('role:vendeur,admin')->group(function () {
        Route::get('/mon-stand', [StandController::class, 'monStand']);
        Route::post('/mon-stand', [StandController::class, 'store']);
        Route::post('/produits', [ProduitController::class, 'store']);
        Route::put('/produits/{id}', [ProduitController::class, 'update']);
        Route::delete('/produits/{id}', [ProduitController::class, 'destroy']);
        Route::put('/stands/{id}', [StandController::class, 'update']);
    });

    // Admin : Catégories
    Route::middleware('role:admin')->group(function () {
        Route::post('/categories', [CategorieController::class, 'store']);
        Route::put('/categories/{id}', [CategorieController::class, 'update']);
        Route::delete('/categories/{id}', [CategorieController::class, 'destroy']);
    });

    // Admin : Codes promo
    Route::middleware('role:admin')->group(function () {
        Route::get('/promo', [PromoCodeController::class, 'index']);
        Route::post('/promo', [PromoCodeController::class, 'store']);
        Route::put('/promo/{id}', [PromoCodeController::class, 'update']);
        Route::delete('/promo/{id}', [PromoCodeController::class, 'destroy']);
    });

    // --- INTERFACE ADMIN : Gestion complète ---
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::get('/stands', [AdminController::class, 'stands']);
        Route::get('/commandes', [AdminController::class, 'commandes']);
        Route::get('/stats', [AdminController::class, 'stats']);
        Route::get('/inscriptions', [InscriptionController::class, 'index']);
        Route::get('/inscriptions/all', [InscriptionController::class, 'all']);
        Route::get('/inscriptions/{id}', [InscriptionController::class, 'show']);
        Route::post('/inscriptions/{id}/approuver', [InscriptionController::class, 'approuver']);
        Route::post('/inscriptions/{id}/rejeter', [InscriptionController::class, 'rejeter']);
    });

    // --- INTERFACE LIVREUR : Gestion des livraisons ---
    Route::middleware('role:livreur')->prefix('livreur')->group(function () {
        Route::get('/profile', [LivreurController::class, 'profile']);
        Route::put('/disponibilite', [LivreurController::class, 'toggleDisponibilite']);
        Route::get('/livraisons-disponibles', [LivreurController::class, 'livraisonsDisponibles']);
        Route::get('/mes-livraisons', [LivreurController::class, 'mesLivraisons']);
        Route::post('/accepter/{id}', [LivreurController::class, 'accepter']);
        Route::post('/livree/{id}', [LivreurController::class, 'marquerLivree']);
        Route::put('/location', [LocationController::class, 'updateLivreurLocation']);
    });

    // --- INTERFACE CAISSIER : Validation des paiements ---
    Route::middleware(['auth:sanctum', 'role:caissier'])->prefix('caissier')->group(function () {
        Route::get('/commandes-en-attente', [CaissierController::class, 'commandesEnAttente']);
        Route::post('/valider-paiement/{id}', [CaissierController::class, 'validerPaiement']);
        Route::get('/historique', [CaissierController::class, 'historique']);
    });

    // --- INTERFACE ADMIN : Créer un caissier ---
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::post('/creer-caissier', [AdminController::class, 'creerCaissier']);
    });

    // --- FEATURE 1: Push Notifications (FCM) ---
    Route::post('/push-subscriptions', [PushNotificationController::class, 'store']);
    Route::delete('/push-subscriptions', [PushNotificationController::class, 'destroy']);
    Route::get('/push-subscriptions', [PushNotificationController::class, 'index']);

    // --- FEATURE 2: Alertes de prix / retour en stock ---
    Route::post('/alertes-stock', [AlerteStockController::class, 'store']);
    Route::delete('/alertes-stock/{id}', [AlerteStockController::class, 'destroy']);
    Route::get('/mes-alertes', [AlerteStockController::class, 'mesAlertes']);

    // --- FEATURE 3: Commande récurrente ---
    Route::middleware('role:client')->group(function () {
        Route::post('/commandes-recurrentes', [CommandeRecurrenteController::class, 'store']);
        Route::get('/commandes-recurrentes', [CommandeRecurrenteController::class, 'index']);
        Route::put('/commandes-recurrentes/{id}/toggle', [CommandeRecurrenteController::class, 'toggle']);
        Route::delete('/commandes-recurrentes/{id}', [CommandeRecurrenteController::class, 'destroy']);
    });

    // --- FEATURE 4: Programme de fidélité ---
    Route::middleware('role:client')->group(function () {
        Route::get('/fidelite', [FideliteController::class, 'summary']);
        Route::post('/fidelite/redeem', [FideliteController::class, 'redeem']);
    });

    // --- FEATURE 5: Retours / Remboursements ---
    Route::middleware('role:client')->group(function () {
        Route::post('/retours', [RetourController::class, 'store']);
        Route::get('/mes-retours', [RetourController::class, 'mesRetours']);
    });
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/retours', [RetourController::class, 'adminIndex']);
        Route::put('/admin/retours/{id}/decision', [RetourController::class, 'adminDecision']);
    });

    // --- FEATURE 6: Statistiques vendeur ---
    Route::middleware('role:vendeur')->group(function () {
        Route::get('/vendeur/stats', [VendeurStatsController::class, 'index']);
    });

});
