-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3307
-- Généré le : ven. 10 juil. 2026 à 11:03
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `senfoire_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `client_id` bigint(20) UNSIGNED NOT NULL,
  `statut` enum('en_attente','payee','en_preparation','prete','en_cours_livraison','livree') NOT NULL DEFAULT 'en_attente',
  `montant_total` decimal(10,2) NOT NULL,
  `montant_commission` decimal(10,2) NOT NULL,
  `mode_paiement` enum('wave','orange_money') NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `ligne_de_commandes`
--

CREATE TABLE `ligne_de_commandes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `commande_id` bigint(20) UNSIGNED NOT NULL,
  `produit_id` bigint(20) UNSIGNED NOT NULL,
  `quantite` int(11) NOT NULL,
  `recommandation` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `livraisons`
--

CREATE TABLE `livraisons` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `commande_id` bigint(20) UNSIGNED NOT NULL,
  `livreur_id` bigint(20) UNSIGNED DEFAULT NULL,
  `statut` enum('disponible','prise_en_charge','en_cours','livree') NOT NULL DEFAULT 'disponible',
  `date_livraison` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `livreurs`
--

CREATE TABLE `livreurs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `points_mensuels` int(11) NOT NULL DEFAULT 0,
  `disponibilite` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `livreurs`
--

INSERT INTO `livreurs` (`id`, `user_id`, `points_mensuels`, `disponibilite`, `created_at`, `updated_at`) VALUES
(1, 4, 150, 1, '2026-07-07 01:37:19', '2026-07-07 01:37:19');

-- --------------------------------------------------------

--
-- Structure de la table `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_07_07_003805_create_stands_table', 1),
(5, '2026_07_07_003806_create_produits_table', 1),
(6, '2026_07_07_003807_create_commandes_table', 1),
(7, '2026_07_07_003828_create_ligne_de_commandes_table', 1),
(8, '2026_07_07_003829_create_paiements_table', 1),
(9, '2026_07_07_003830_create_livreurs_table', 1),
(10, '2026_07_07_003831_create_livraisons_table', 1),
(11, '2026_07_07_010700_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

CREATE TABLE `paiements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `commande_id` bigint(20) UNSIGNED NOT NULL,
  `montant` decimal(10,2) NOT NULL,
  `part_vendeur` decimal(10,2) NOT NULL,
  `part_commission` decimal(10,2) NOT NULL,
  `reference_prestataire` varchar(255) NOT NULL,
  `statut` enum('succes','echoue','initie') NOT NULL DEFAULT 'initie',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 2, 'auth_token', '0f8a7756a3e7a242af01e24ae142ecb6e7b8159e6ab2130b9985cbfde1f0a1ca', '[\"*\"]', NULL, NULL, '2026-07-07 03:05:04', '2026-07-07 03:05:04'),
(2, 'App\\Models\\User', 2, 'auth_token', '9398b333bbb1df51a87d20fed53f31828a3c67c7ebd75134ee44d773ed57546f', '[\"*\"]', NULL, NULL, '2026-07-07 14:57:31', '2026-07-07 14:57:31'),
(3, 'App\\Models\\User', 2, 'auth_token', '83aa2028ef495dd6a6aee2939b5c64469e778d029be7c2ed3ba28ca095962dce', '[\"*\"]', NULL, NULL, '2026-07-07 15:01:09', '2026-07-07 15:01:09'),
(4, 'App\\Models\\User', 2, 'auth_token', '23633febf14f6930dd9477da29996c81ea512ebdbb99cdd78d7fad3e5c403b5d', '[\"*\"]', NULL, NULL, '2026-07-07 15:01:16', '2026-07-07 15:01:16'),
(5, 'App\\Models\\User', 2, 'auth_token', 'be70ce450de2105398d10fbc1f8b2463d61ec804626ff1b95752e039e1655416', '[\"*\"]', NULL, NULL, '2026-07-07 15:01:30', '2026-07-07 15:01:30'),
(6, 'App\\Models\\User', 2, 'auth_token', 'ca6cbbf698f70b29a195e8b87932068a208fc4020bd106f752626eded76dc8e5', '[\"*\"]', NULL, NULL, '2026-07-07 15:02:44', '2026-07-07 15:02:44'),
(7, 'App\\Models\\User', 2, 'auth_token', '23fd87712092d433963e2b9e07bf70288ffc69314ef6c7c5a193abae1e513a99', '[\"*\"]', NULL, NULL, '2026-07-07 15:03:10', '2026-07-07 15:03:10'),
(8, 'App\\Models\\User', 2, 'auth_token', '9a10405b9cfd693432f5600b891fac535d33ef342330c35d1b227aff33a3c495', '[\"*\"]', NULL, NULL, '2026-07-07 15:12:28', '2026-07-07 15:12:28'),
(9, 'App\\Models\\User', 2, 'auth_token', '63658c7a4264d2e83e221b95dea95a07366867e55bef19ac45745f1e1eb65b34', '[\"*\"]', NULL, NULL, '2026-07-07 15:12:30', '2026-07-07 15:12:30'),
(10, 'App\\Models\\User', 2, 'auth_token', '6fee6b2b220ab47b8d384881f4e655677d0b7645859850eda7be24cf600aec88', '[\"*\"]', NULL, NULL, '2026-07-07 15:20:29', '2026-07-07 15:20:29'),
(11, 'App\\Models\\User', 2, 'auth_token', 'da3278ce3cb9698130d7b020062d2f9ea72c5c291d0a641ed03b3db23614f32a', '[\"*\"]', NULL, NULL, '2026-07-07 15:22:26', '2026-07-07 15:22:26'),
(12, 'App\\Models\\User', 2, 'auth_token', '07bc01a0d2cc6cdffdf67abe8feb364f443212e91ebec1c42f509c16b72cb9a4', '[\"*\"]', NULL, NULL, '2026-07-07 15:22:39', '2026-07-07 15:22:39'),
(13, 'App\\Models\\User', 2, 'auth_token', '3598680adca01e0f23bc24374280a0420e0bb097da5d8bfe9f9852cbca25b730', '[\"*\"]', NULL, NULL, '2026-07-07 15:23:32', '2026-07-07 15:23:32'),
(14, 'App\\Models\\User', 2, 'auth_token', 'f754a3d82ad7b1e19f18db0b5173504ddcc0dea6b0f3d2653725253e058f4888', '[\"*\"]', NULL, NULL, '2026-07-07 15:26:01', '2026-07-07 15:26:01'),
(15, 'App\\Models\\User', 2, 'auth_token', '5e8d2b72dbbce4700560d39badf2c8eaf71ada3fdf2b9f8adebeeb1c27b35e3e', '[\"*\"]', NULL, NULL, '2026-07-07 15:28:01', '2026-07-07 15:28:01'),
(19, 'App\\Models\\User', 2, 'auth_token', '875e63fa6e747c50ad6cf5072125eecf84e012660cfc261d4a7697064fbc0abb', '[\"*\"]', '2026-07-07 19:20:34', NULL, '2026-07-07 15:41:36', '2026-07-07 19:20:34'),
(20, 'App\\Models\\User', 2, 'auth_token', '44026671cb41e3036e82d3ccec68e4bea3534e4671e2c96a712fbe1ebbdb5330', '[\"*\"]', NULL, NULL, '2026-07-07 23:28:26', '2026-07-07 23:28:26'),
(21, 'App\\Models\\User', 2, 'auth_token', '8108a06ed5ed8efe7880d13af676a67d2e5961c601e3163bc8c7253dd13b3ff9', '[\"*\"]', NULL, NULL, '2026-07-07 23:34:02', '2026-07-07 23:34:02'),
(22, 'App\\Models\\User', 2, 'auth_token', '2a547c526b9a56b33d60df66a7b61ce22d826b320888a8cc89376c5e8dde2c44', '[\"*\"]', NULL, NULL, '2026-07-07 23:42:47', '2026-07-07 23:42:47'),
(23, 'App\\Models\\User', 2, 'auth_token', '653216f1142db616c74c2c8ba5cb7632543849aaf45811613d0f6b283f56bfe7', '[\"*\"]', '2026-07-08 00:12:46', NULL, '2026-07-07 23:46:32', '2026-07-08 00:12:46'),
(24, 'App\\Models\\User', 2, 'auth_token', '309e51756653839c8d0fd34efa6f098479d85c0603b664a67edd2c76d3341562', '[\"*\"]', '2026-07-08 00:19:40', NULL, '2026-07-08 00:17:52', '2026-07-08 00:19:40'),
(25, 'App\\Models\\User', 2, 'auth_token', '495ce4ab028d2f6edf20f49866c4a093e6fbc0baf5c2e676cabf2d3d19f411d2', '[\"*\"]', '2026-07-08 22:30:47', NULL, '2026-07-08 21:29:40', '2026-07-08 22:30:47'),
(26, 'App\\Models\\User', 2, 'auth_token', '3113ec37d5f90843b02da891de76d2c4fdf9122e4c4289c62708433d45c57cf5', '[\"*\"]', '2026-07-09 02:26:28', NULL, '2026-07-08 22:30:50', '2026-07-09 02:26:28'),
(27, 'App\\Models\\User', 2, 'auth_token', '3ea7c244375f0e7ec122ff3c0882e3ce3e06cee852a56ec99d71888673076d6a', '[\"*\"]', '2026-07-09 02:46:43', NULL, '2026-07-09 02:26:32', '2026-07-09 02:46:43'),
(28, 'App\\Models\\User', 2, 'auth_token', '6674ba76a5d6851aa70b97f0580d887e343f41b092c70d57a8f6269bcd603afa', '[\"*\"]', '2026-07-10 08:55:56', NULL, '2026-07-09 02:46:46', '2026-07-10 08:55:56'),
(29, 'App\\Models\\User', 2, 'auth_token', '0fb7f7f3241ef2a0852dd5a3c6779747a11c0bba9b6d7d32fe5f31e0b1a70204', '[\"*\"]', '2026-07-10 09:02:33', NULL, '2026-07-10 08:56:01', '2026-07-10 09:02:33');

-- --------------------------------------------------------

--
-- Structure de la table `produits`
--

CREATE TABLE `produits` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `stand_id` bigint(20) UNSIGNED NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `prix` decimal(10,2) NOT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `disponibilite` tinyint(1) NOT NULL DEFAULT 1,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('DecrXe6zlmyyooaliJYPpGfMYsyWkDNq4T7vTw3S', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiem9lVllobUVhUWxseFBOQnQ2VXlRY09vaXZZbENBN1M2cXNnd2hjaCI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1783563973),
('p2XOuRBxuTpobIm3kRNnjyvuBqWW9bdoYBhXLlu3', NULL, '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Code/1.127.0 Chrome/148.0.7778.97 Electron/42.2.0 Safari/537.36', 'YTozOntzOjY6Il90b2tlbiI7czo0MDoiTEhwRXVSeVRSSEVMd2JYM2JvZlpCRHlManBFUnNyQkNmZ25SSzVjMiI7czo5OiJfcHJldmlvdXMiO2E6Mjp7czozOiJ1cmwiO3M6MjE6Imh0dHA6Ly8xMjcuMC4wLjE6ODAwMCI7czo1OiJyb3V0ZSI7Tjt9czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319fQ==', 1783466841);

-- --------------------------------------------------------

--
-- Structure de la table `stands`
--

CREATE TABLE `stands` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `localisation` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `stands`
--

INSERT INTO `stands` (`id`, `user_id`, `nom`, `description`, `logo`, `localisation`, `created_at`, `updated_at`) VALUES
(1, 2, 'Guédiawaye Tech Space', 'Boutique spécialisée dans les gadgets et accessoires informatiques de pointe.', 'https://images.unsplash.com/photo-1531297484001-80022131f5a1', 'Pavillon A, Allée 3, Stand 42', '2026-07-07 01:37:19', '2026-07-07 01:37:19');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nom` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telephone` varchar(255) NOT NULL,
  `role` enum('admin','vendeur','client','livreur') NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `nom`, `email`, `password`, `telephone`, `role`, `email_verified_at`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Mouhammad Admin', 'admin@senfoire.sn', '$2y$12$8cpThBCYxwbKmvNIM8PhfewpqY/4KrNcJo1GYpJBvnSarY4HSAaT.', '771234567', 'admin', NULL, NULL, '2026-07-07 01:37:18', '2026-07-07 01:37:18'),
(2, 'Alpha Electronique', 'vendeur@senfoire.sn', '$2y$12$4yTiQgWnYxkO0AXlUeIq8uoxlwMh07O3yvWhKHyXk.Ym.020VpjNO', '772345678', 'vendeur', NULL, NULL, '2026-07-07 01:37:19', '2026-07-07 01:37:19'),
(3, 'Fatou Diop', 'client@senfoire.sn', '$2y$12$ybWVUbk3f2xFeW5vV4TxCOJIYR5hL0VD0Blv1B6K27H.6a1cI6u5e', '773456789', 'client', NULL, NULL, '2026-07-07 01:37:19', '2026-07-07 01:37:19'),
(4, 'Ibrahima TiakTiak', 'livreur@senfoire.sn', '$2y$12$TIgJpWL3mrVqorcwNk5ixuGxqveeuRgSeZeIWkftXnpL16s2xKA.y', '774567890', 'livreur', NULL, NULL, '2026-07-07 01:37:19', '2026-07-07 01:37:19');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Index pour la table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `commandes_client_id_foreign` (`client_id`);

--
-- Index pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Index pour la table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Index pour la table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `ligne_de_commandes`
--
ALTER TABLE `ligne_de_commandes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ligne_de_commandes_commande_id_foreign` (`commande_id`),
  ADD KEY `ligne_de_commandes_produit_id_foreign` (`produit_id`);

--
-- Index pour la table `livraisons`
--
ALTER TABLE `livraisons`
  ADD PRIMARY KEY (`id`),
  ADD KEY `livraisons_commande_id_foreign` (`commande_id`),
  ADD KEY `livraisons_livreur_id_foreign` (`livreur_id`);

--
-- Index pour la table `livreurs`
--
ALTER TABLE `livreurs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `livreurs_user_id_foreign` (`user_id`);

--
-- Index pour la table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `paiements_reference_prestataire_unique` (`reference_prestataire`),
  ADD KEY `paiements_commande_id_foreign` (`commande_id`);

--
-- Index pour la table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Index pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Index pour la table `produits`
--
ALTER TABLE `produits`
  ADD PRIMARY KEY (`id`),
  ADD KEY `produits_stand_id_foreign` (`stand_id`);

--
-- Index pour la table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Index pour la table `stands`
--
ALTER TABLE `stands`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stands_user_id_foreign` (`user_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_telephone_unique` (`telephone`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `ligne_de_commandes`
--
ALTER TABLE `ligne_de_commandes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `livraisons`
--
ALTER TABLE `livraisons`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `livreurs`
--
ALTER TABLE `livreurs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `paiements`
--
ALTER TABLE `paiements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT pour la table `produits`
--
ALTER TABLE `produits`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `stands`
--
ALTER TABLE `stands`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `commandes_client_id_foreign` FOREIGN KEY (`client_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `ligne_de_commandes`
--
ALTER TABLE `ligne_de_commandes`
  ADD CONSTRAINT `ligne_de_commandes_commande_id_foreign` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `ligne_de_commandes_produit_id_foreign` FOREIGN KEY (`produit_id`) REFERENCES `produits` (`id`);

--
-- Contraintes pour la table `livraisons`
--
ALTER TABLE `livraisons`
  ADD CONSTRAINT `livraisons_commande_id_foreign` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `livraisons_livreur_id_foreign` FOREIGN KEY (`livreur_id`) REFERENCES `livreurs` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `livreurs`
--
ALTER TABLE `livreurs`
  ADD CONSTRAINT `livreurs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `paiements_commande_id_foreign` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `produits`
--
ALTER TABLE `produits`
  ADD CONSTRAINT `produits_stand_id_foreign` FOREIGN KEY (`stand_id`) REFERENCES `stands` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `stands`
--
ALTER TABLE `stands`
  ADD CONSTRAINT `stands_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
