<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commandes_recurrentes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->string('frequence'); // hebdomadaire, bimensuel, mensuel
            $table->date('prochaine_commande');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('commande_recurrente_produits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_recurrente_id')->constrained('commandes_recurrentes')->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained()->cascadeOnDelete();
            $table->integer('quantite')->default(1);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commande_recurrente_produits');
        Schema::dropIfExists('commandes_recurrentes');
    }
};
