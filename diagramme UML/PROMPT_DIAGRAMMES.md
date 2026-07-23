# Description complète du projet SENFOIRE

## Présentation générale

SENFOIRE est une application web de type marketplace (marché en ligne) multi-vendeurs conçue pour la foire internationale du Sénégal. La plateforme connecte plusieurs acteurs : des clients qui achètent, des vendeurs qui gèrent leurs stands/boutiques, des livreurs qui assurent les livraisons, des caissiers qui valident les paiements en espèces, et des administrateurs qui supervisent l'ensemble.

L'application est une PWA (Progressive Web App) accessible sur mobile et desktop, avec un mode hors ligne. Elle fonctionne en français, anglais et wolof.

## Stack technique

- **Backend :** Laravel 12, PHP 8.2+, MySQL/MariaDB
- **Authentification :** Laravel Sanctum (tokens API)
- **Temps réel :** Laravel Reverb (WebSockets), 3 events broadcast
- **Notifications push :** Firebase Cloud Messaging
- **Génération PDF :** DomPDF (factures)
- **Frontend :** React 19 (JSX), Vite 8, Tailwind CSS v4, React Router v7
- **État global :** React Context (3 providers)
- **Hors ligne :** Service Worker via vite-plugin-pwa + cache localStorage
- **Cartographie :** Leaflet (géolocalisation livreur en temps réel)

## Rôles utilisateurs

5 rôles avec middleware de contrôle d'accès : `admin`, `vendeur`, `client`, `livreur`, `caissier`.

---

## Backend — Modèles de données (25 modèles Eloquent)

### Authentification

**User** (table `users`) — Classe étend `Authenticatable`, traits `HasApiTokens`, `HasFactory`, `Notifiable`.
Attributs : id, nom, prenom, email, telephone, pseudo, password, role, cni, photo_cni, date_naissance, lieu_naissance, latitude, longitude, avatar, created_at, updated_at.
Relations : `hasOne(Stand)`, `hasOne(Livreur)`, `hasMany(Commande)`, `hasMany(Notification)`, `hasMany(Conversation)`, `hasMany(Message)`, `hasMany(Favori)`, `hasMany(Avi)`.

**Inscription** (table `inscriptions`) — Entité transitoire pour la demande d'inscription. Pas de relations Eloquent.
Attributs : id, nom, prenom, email, telephone, pseudo, password, role, cni, photo_cni, date_naissance, lieu_naissance, nom_stand, description_stand, statut, motif_rejet, created_at, updated_at.
Statuts possibles : `en_attente`, `approuve`, `rejete`.

**Notification** (table `notifications`).
Attributs : id, user_id, type, message, lu, created_at, updated_at.
Relation : `belongsTo(User)`.

**PushSubscription** (table `push_subscriptions`).
Attributs : id, user_id, endpoint, public_key, auth_token, p256dh_key, created_at, updated_at.
Relation : `belongsTo(User)`.

### Catalogue

**Stand** (table `stands`).
Attributs : id, user_id, nom, description, logo, localisation, latitude, longitude, created_at, updated_at.
Relations : `belongsTo(User)` vendeur, `hasMany(Produit)`, `morphMany(Avi)`.
Accesseurs : note_moyenne, nombre_avis.

**Produit** (table `produits`).
Attributs : id, stand_id, categorie_id, nom, description, prix, stock, disponibilite, photos (JSON cast), created_at, updated_at.
Relations : `belongsTo(Stand)`, `belongsTo(Categorie)`, `morphMany(Avi)`, `hasMany(Favori)`.
Accesseurs : image (première photo en URL relative), note_moyenne, nombre_avis.

**Categorie** (table `categories`).
Attributs : id, nom, slug, description, image, est_active, created_at, updated_at.
Relation : `hasMany(Produit)`.

### Commandes

**Commande** (table `commandes`).
Attributs : id, client_id, statut, montant_total, montant_commission, prix_livraison, distance_km, mode_paiement, promo_code_id, montant_reduction, montant_total_apres_reduction, fidelite_points_used, valide_caissier, created_at, updated_at.
Statuts : `en_attente`, `payee`, `en_preparation`, `prete`, `en_cours_livraison`, `livree`.
Modes de paiement : `wave`, `orange_money`, `especes`.
Relations : `belongsTo(User)` client, `hasMany(LigneDeCommande)`, `hasOne(Paiement)`, `hasOne(Livraison)`, `belongsTo(PromoCode)`, `hasOne(Conversation)`.

**LigneDeCommande** (table `ligne_de_commandes`).
Attributs : id, commande_id, produit_id, quantite, recommandation, created_at, updated_at.
Relations : `belongsTo(Commande)`, `belongsTo(Produit)`.

**Paiement** (table `paiements`).
Attributs : id, commande_id, montant, part_vendeur, part_commission, reference_prestataire, statut, created_at, updated_at.
Statuts : `initie`, `succes`, `echoue`.
Relation : `belongsTo(Commande)`.

**CommandeRecurrente** (table `commande_recurrentes`).
Attributs : id, client_id, frequence, prochaine_commande, active, created_at, updated_at.
Fréquences : `hebdomadaire`, `bimensuel`, `mensuel`.
Relations : `belongsTo(User)`, `belongsToMany(Produit)` via pivot avec quantite.

**CommandeRecurrenteProduit** (table pivot `commande_recurrente_produits`).
Attributs : id, commande_recurrente_id, produit_id, quantite.
Relations : `belongsTo(CommandeRecurrente)`, `belongsTo(Produit)`.

### Livraison

**Livreur** (table `livreurs`).
Attributs : id, user_id, points_mensuels, disponibilite, created_at, updated_at.
Relations : `belongsTo(User)`, `hasMany(Livraison)`.

**Livraison** (table `livraisons`).
Attributs : id, commande_id, livreur_id, statut, prix_livraison, distance_km, date_livraison, created_at, updated_at.
Statuts : `disponible`, `prise_en_charge`, `en_cours`, `livree`.
Relations : `belongsTo(Commande)`, `belongsTo(Livreur)`.

**LivreurRating** (table `livreur_ratings`).
Attributs : id, livraison_id, client_id, livreur_id, note, commentaire, created_at, updated_at.
Relations : `belongsTo(Livraison)`, `belongsTo(User)` client, `belongsTo(Livreur)`.

### Messagerie

**Conversation** (table `conversations`).
Attributs : id, commande_id, client_id, vendeur_id, admin_id, created_at, updated_at.
Relations : `belongsTo(Commande)`, `belongsTo(User)` client, `belongsTo(User)` vendeur, `belongsTo(User)` admin, `hasMany(Message)`, `hasOne(Message)` dernier message.

**Message** (table `messages`).
Attributs : id, conversation_id, sender_id, contenu, lu, created_at, updated_at.
Relations : `belongsTo(Conversation)`, `belongsTo(User)` sender.

### Interaction

**Avi** (table `avis`) — Relation polymorphique.
Attributs : id, client_id, avisable_type, avisable_id, note, commentaire, created_at, updated_at.
Relations : `belongsTo(User)` client, `morphTo()` avisable (peut être un Produit ou un Stand).

**Favori** (table `favoris`).
Attributs : id, client_id, produit_id, created_at, updated_at.
Relations : `belongsTo(User)`, `belongsTo(Produit)`.

### Fidélité

**FideliteClient** (table `fidelite_clients`).
Attributs : id, client_id, points, total_points_gagnes, niveau, created_at, updated_at.
Niveaux : `bronze`, `argent`, `or`, `diamant`.
Relations : `belongsTo(User)`, `hasMany(FideliteHistorique)`.

**FideliteHistorique** (table `fidelite_historique`).
Attributs : id, client_id, points, type, description, commande_id, created_at, updated_at.
Types : `gain`, `redemption`.
Relations : `belongsTo(User)`, `belongsTo(Commande)`.

### Promotions

**PromoCode** (table `promo_codes`).
Attributs : id, code, type, valeur, montant_min_commande, utilisation_max, utilisation_count, stand_id, date_debut, date_fin, est_actif, created_at, updated_at.
Types : `pourcentage`, `montant_fixe`.
Relations : `belongsTo(Stand)`, `hasMany(Commande)`.
Méthode : `estValide()` retourne un booléen.

### Retours et fonctionnalités avancées

**Retour** (table `retours`).
Attributs : id, commande_id, client_id, produit_id, quantite, motif, description, statut, montant_remboursement, decision_admin, created_at, updated_at.
Statuts : `en_attente`, `approuve`, `refuse`, `rembourse`.
Relations : `belongsTo(Commande)`, `belongsTo(User)`, `belongsTo(Produit)`.

**AlerteStock** (table `alerte_stocks`).
Attributs : id, user_id, produit_id, declenchee, declenchee_at, created_at, updated_at.
Relations : `belongsTo(User)`, `belongsTo(Produit)`.

**Litige** (table `litiges`) — Feature supprimée mais le code existe encore.
Attributs : id, commande_id, client_id, vendeur_id, type, description, statut, resolution, decision, montant_rembourse, resolu_par, resolu_le, created_at, updated_at.
Relations : `belongsTo(Commande)`, `belongsTo(User)` client, `belongsTo(User)` vendeur, `belongsTo(User)` resoluPar.

---

## Backend — Controllers (25 controllers)

Tous étendent la classe abstraite `Controller`.

**Authentification :**
- `AuthController` — register, login, logout
- `InscriptionController` — store, index, all, show, approuver, rejeter, checkStatut, finaliserCompte (8 méthodes, gestion complète du cycle d'inscription)
- `PasswordResetController` — envoyerCode, verifierCode, reinitialiser

**Administration :**
- `AdminController` — users, createUser, deleteUser, stands, commandes, stats, creerCaissier (7 méthodes)
- `NotificationController` — index, unreadCount, markAsRead, markAllAsRead

**Catalogue :**
- `ProduitController` — index, mesProduits, store, show, update, destroy
- `CategorieController` — index, store, show, update, destroy
- `StandController` — monStand, store, update
- `FavoriController` — index, toggle, check
- `AviController` — store, produit, stand, destroy

**Commandes et paiement :**
- `CommandeController` — store (crée commande complète avec lignes, paiement, livraison, promo, fidélité), mesCommandes
- `CommandeRecurrenteController` — store, index, toggle, destroy
- `PaiementInfoController` — index (retourne les infos statiques Wave et Orange Money)
- `FactureController` — telecharger (génère un PDF avec DomPDF)
- `PromoCodeController` — index, store, update, valider, destroy
- `CaissierController` — commandesEnAttente, validerPaiement, historique

**Livraison :**
- `LivreurController` — profile, toggleDisponibilite, livraisonsDisponibles, mesLivraisons, accepter, marquerLivree, noterLivraison (7 méthodes)
- `LocationController` — update, getLocation, getLivreurLocation, updateLivreurLocation (géolocalisation temps réel)

**Messagerie :**
- `MessageController` — conversations, messages, envoyer, nonLu, creerConversationAdmin

**Fonctionnalités avancées :**
- `AlerteStockController` — store, destroy, mesAlertes
- `FideliteController` — summary, redeem
- `RetourController` — store, mesRetours, adminIndex, adminDecision
- `PushNotificationController` — store, destroy, index
- `VendeurStatsController` — index (stats vendeur : ventes, revenus, avis)

---

## Backend — Services métier (3)

**NotificationService** — Service statique pour l'envoi de notifications. Utilise FCM pour les push et le modèle Notification pour les notifications in-app. Méthodes : sendPushNotification (par utilisateur), sendBulkPushNotification (par liste d'IDs), sendToRole (par rôle). Méthode privée sendToEndpoint pour l'appel HTTP vers FCM.

**FideliteService** — Service statique gérant le programme de fidélité. Constantes : POINTS_PER_1000_FCFA = 1, 4 niveaux (bronze/argent/or/diamant) avec remises croissantes (0%/2%/5%/10%). Méthodes : getOrCreate (récupère ou crée le profil fidélité), awardPoints (attribution de points, 1 pt par 1000 FCFA), redeemPoints (échange de points, 1 pt = 10 FCFA), getSummary (récapitulatif), calculateTier (calcule le niveau), getNextTier, pointsForNextTier.

**CalculLivraison** — Service statique de calcul du prix de livraison. Utilise la formule de Haversine pour calculer la distance entre le client et les stands. Constantes : TARIF_BASE_PAR_KM = 100 FCFA, FRAIS_SUPPLEMENT_BOUTIQUE = 500 FCFA par boutique supplémentaire, minimum 500 FCFA. Méthodes : calculerPrixLivraison (retourne prix, distance, détails), getDistanceHaversine.

---

## Backend — Events broadcast (3)

Tous implémentent `ShouldBroadcast` et utilisent les traits `Dispatchable`, `InteractsWithSockets`, `SerializesModels`.

**OrderStatusEvent** — Diffusé lors des changements de statut d'une commande. Properties : commande (Commande), statut (String). Channels : `commande.{id}`, `user.{client_id}`. Broadcast name : `commande.statut`.

**LocationUpdateEvent** — Diffusé pour la géolocalisation en temps réel du livreur. Properties : livreurId, latitude, longitude, commandeId. Channel : `livreur-location.{commandeId}`. Broadcast name : `location.update`.

**NewMessageEvent** — Diffusé lors de l'envoi d'un message. Properties : message (Message). Channel : `conversation.{conversation_id}`. Broadcast name : `message.new`.

---

## Backend — Console Commands (1)

**ProcessRecurrentes** — Commande artisan `commandes:process-recurrentes`. Traite les commandes récurrentes dont la date d'échéance est dépassée. Vérifie le stock, crée la commande + lignes + paiement, calcule la livraison, notifie les caissiers par push. En cas de stock insuffisant, reporte de 3 jours et notifie le client. Planifie la prochaine commande selon la fréquence.

---

## Backend — Mail (1)

**PasswordResetCodeMail** — Mailable envoyant le code de réinitialisation de mot de passe. Utilise la vue `emails.password-reset`.

---

## Backend — Routes API

### Routes publiques (pas d'authentification)
- POST `/register` → AuthController@register
- POST `/login` → AuthController@login
- POST `/inscriptions` → InscriptionController@store
- GET `/inscriptions/{id}/statut` → InscriptionController@checkStatut
- POST `/inscriptions/{id}/finaliser` → InscriptionController@finaliserCompte
- POST `/password/email` → PasswordResetController@envoyerCode
- POST `/password/verify` → PasswordResetController@verifierCode
- POST `/password/reset` → PasswordResetController@reinitialiser
- GET `/produits` → ProduitController@index
- GET `/produits/{id}` → ProduitController@show

### Routes authentifiées (tous rôles)
- POST `/logout`, GET `/me`
- GET/POST `/notifications` (CRUD)
- GET/POST `/conversations`, `/messages/envoyer`, `/messages/non-lu`
- GET `/favoris`, POST `/favoris/toggle`, GET `/favoris/check/{id}`
- GET `/categories`, GET `/categories/{id}`
- GET `/avis/produit/{id}`, `/avis/stand/{id}`
- POST `/promo/valider`
- PUT `/location`, GET `/location/{userId}`
- GET `/commandes/{id}/facture`
- POST `/livraisons/{id}/noter`
- CRUD push-subscriptions, alertes-stock

### Routes client
- POST `/commandes`, GET `/mes-commandes`
- CRUD commandes-recurrentes
- POST/DELETE `/avis`
- GET `/fidelite`, POST `/fidelite/redeem`
- POST `/retours`, GET `/mes-retours`

### Routes vendeur
- GET/POST `/mon-stand`, PUT `/stands/{id}`
- GET `/mes-produits`, POST/PUT/DELETE `/produits`
- GET `/vendeur/stats`

### Routes admin
- CRUD `/admin/users`, `/admin/stands` (lecture), `/admin/commandes`, `/admin/stats`
- CRUD `/categories`, `/promo`
- GET/POST `/admin/inscriptions` (liste, approuver, rejeter)
- POST `/admin/creer-caissier`
- GET/PUT `/admin/retours`

### Routes livreur
- GET `/livreur/profile`, PUT `/livreur/disponibilite`
- GET `/livreur/livraisons-disponibles`, `/livreur/mes-livraisons`
- POST `/livreur/accepter/{id}`, `/livreur/livree/{id}`
- PUT `/livreur/location`

### Routes caissier
- GET `/caissier/commandes-en-attente`
- POST `/caissier/valider-paiement/{id}`
- GET `/caissier/historique`

---

## Frontend — Architecture React

### Pages (11)

- **Login** — Page de connexion avec formulaire email/mot de passe. Intègre aussi le flux mot de passe oublié en 3 étapes (email → code OTP → nouveau mot de passe).
- **ChoixRole** — Page de sélection du rôle avant inscription (client, vendeur, livreur).
- **FormulaireClient** — Formulaire d'inscription client (nom, email, téléphone, mot de passe).
- **FormulaireVendeur** — Formulaire d'inscription vendeur (nom, email, téléphone, mot de passe, nom boutique, description boutique, photo CNI).
- **FormulaireLivreur** — Formulaire d'inscription livreur (nom, email, téléphone, mot de passe, zones de livraison, photo CNI).
- **AttenteValidation** — Page d'attente après soumission d'une inscription. Polling toutes les 5 secondes sur `/inscriptions/{id}/statut`. Affiche le motif en cas de rejet.
- **SetupCredentials** — Page de finalisation du compte après approbation (définir email et mot de passe).
- **VisiteurCatalogue** — Catalogue public des produits avec recherche, filtres par stand/catégorie, pagination infinie, comparaison de produits.
- **AdminDashboard** — Dashboard complet avec 11 onglets : overview, inscriptions (attente/approbation), gestion users, stands, catégories, codes promo, commandes, livraisons, messages, retours.
- **VendeurDashboard** — Dashboard vendeur avec onglets : produits (CRUD), commandes reçues, messages clients, édition stand (nom, description, logo, position GPS).
- **ClientDashboard** — Dashboard client avec : catalogue/panier, commandes, suivi livraison (carte Leaflet), fidélité, messages, retours, commandes récurrentes.
- **LivreurDashboard** — Dashboard livreur avec : livraisons disponibles, livraisons en cours (avec mise à jour position GPS), livraisons terminées, profil et disponibilité.
- **CaissierDashboard** — Dashboard caissier avec : commandes en attente de validation, saisie du montant reçu, historique des validations.

### Composants réutilisables (22)

**ProductCard** — Carte d'affichage d'un produit avec image, nom, prix, note, boutons favori/partage/alerte prix. Props : product, onAddToCart, cartQuantity, showActions, etc.

**AddProductModal** — Modal de création de produit (nom, description, prix, stock, catégorie, photo).

**EditProductModal** — Modal de modification de produit.

**MessageModal** — Modal de messagerie temps réel pour une commande. Charge les messages, envoie en temps réel via Echo.

**ReturnModal** — Modal de demande de retour produit (motif, description).

**ReviewModal** — Modal de notation/avis après livraison (étoiles + commentaire).

**RecurringOrderModal** — Modal de configuration d'une commande récurrente (fréquence, sélection de produits).

**LitigeModal** — Modal de litige (feature supprimée mais code présent).

**ConfirmDialog** — Dialogue de confirmation générique (style danger ou standard).

**FavoriButton** — Bouton toggle favori (coeur) avec état local.

**ShareButton** — Bouton de partage avec dropdown (copier lien, Facebook, Twitter).

**StarRating** — Affichage et sélection d'une note en étoiles.

**PriceAlertButton** — Bouton d'abonnement aux alertes de prix pour un produit.

**CompareWidget** — Widget flottant de comparaison de produits côte à côte.

**LocationPicker** — Sélecteur de position sur une carte Leaflet (clic pour placer un marker).

**NotificationBell** — Cloche de notifications avec badge compteur et dropdown liste.

**LoyaltyCard** — Carte d'affichage du statut fidélité (niveau, points, prochain palier).

**OfflineIndicator** — Indicateur de connexion (offline/online) avec nombre d'items en attente de synchronisation.

**ReviewsList** — Liste d'avis avec étoiles.

**LangSelector** — Sélecteur de langue (fr/en/wo).

**AuroraBackground** — Fond animé style aurore boréale (page de connexion).

**Toast** — Notification toast (success/error/info) avec animation.

### Context React (3)

**AuthProvider** — Fournit `user`, `loading`, `login()`, `loginWithData()`, `logout()`. Au montage, vérifie le token dans localStorage et appelle `/api/me` pour restaurer la session.

**I18nProvider** — Fournit `lang`, `t(key, params)`, `changeLang()`. Supporte les clés imbriquées par points, l'interpolation `{param}`, et 3 langues (fr, en, wo).

**ToastProvider** — Fournit `success()`, `error()`, `info()` pour afficher des notifications toast.

### Services côté client (4)

**API** — Instance Axios avec baseURL `/api`, timeout 15s. Intercepteur automatique qui injecte le token Bearer depuis localStorage.

**EchoService** — Initialise Laravel Echo avec Reverb (WebSocket WSS). Fournit des méthodes pour joindre les channels : `conversation.{orderId}`, `livreur-location.{orderId}`, `order-status.{orderId}`, `user.{userId}`.

**OfflineService** — Gestion du cache localStorage pour le mode hors ligne. Clés : panier offline, produits offline, actions offline. Méthodes : isOnline, addToOfflineCart, getOfflineCart, clearOfflineCart, saveOfflineProducts, getOfflineProducts, addToOfflineActions, getOfflineActions, clearOfflineActions.

**PushNotificationService** — Gestion des abonnements push FCM. Méthodes : requestNotificationPermission, subscribeToPushNotifications, unsubscribeFromPushNotifications, getSubscription.

---

## Diagrammes existants

Dans le dossier `diagramme UML/` il y a déjà :

**Diagrammes de cas d'utilisation (5 fichiers PNG) :**
- Administrateur
- Caissier
- Client
- Livreur
- Vendeur

**Diagrammes d'activité (3 fichiers .puml + .png) :**
- PasserCommande
- InscriptionValidation
- Livraison
