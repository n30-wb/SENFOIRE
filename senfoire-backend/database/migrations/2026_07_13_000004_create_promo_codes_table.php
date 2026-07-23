<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->enum('type', ['pourcentage', 'montant_fixe']);
            $table->decimal('valeur', 10, 2);
            $table->decimal('montant_min_commande', 10, 2)->default(0);
            $table->integer('utilisation_max')->nullable();
            $table->integer('utilisation_count')->default(0);
            $table->foreignId('stand_id')->nullable()->constrained('stands')->cascadeOnDelete();
            $table->dateTime('date_debut')->nullable();
            $table->dateTime('date_fin')->nullable();
            $table->boolean('est_actif')->default(true);
            $table->timestamps();
        });

        Schema::table('commandes', function (Blueprint $table) {
            $table->foreignId('promo_code_id')->nullable()->constrained('promo_codes')->nullOnDelete();
            $table->decimal('montant_reduction', 10, 2)->default(0);
            $table->decimal('montant_total_apres_reduction', 10, 2)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('commandes', function (Blueprint $table) {
            $table->dropForeign(['promo_code_id']);
            $table->dropColumn(['promo_code_id', 'montant_reduction', 'montant_total_apres_reduction']);
        });
        Schema::dropIfExists('promo_codes');
    }
};
