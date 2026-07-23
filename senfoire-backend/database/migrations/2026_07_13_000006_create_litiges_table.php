<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('litiges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->constrained('commandes')->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('vendeur_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type', ['produit_non_conforme', 'commande_non_livree', 'remboursement', 'autre']);
            $table->text('description');
            $table->enum('statut', ['ouvert', 'en_cours', 'resolu', 'rejete'])->default('ouvert');
            $table->text('resolution')->nullable();
            $table->enum('decision', ['remboursement_total', 'remboursement_partiel', 'aucun'])->nullable();
            $table->decimal('montant_rembourse', 10, 2)->default(0);
            $table->foreignId('resolu_par')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolu_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('litiges');
    }
};
