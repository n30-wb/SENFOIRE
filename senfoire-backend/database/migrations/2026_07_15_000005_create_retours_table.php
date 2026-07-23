<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retours', function (Blueprint $table) {
            $table->id();
            $table->foreignId('commande_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained()->cascadeOnDelete();
            $table->integer('quantite')->default(1);
            $table->string('motif'); // produit_defectueux, mauvais_article, pas_satisfait, autre
            $table->text('description')->nullable();
            $table->string('statut')->default('en_attente'); // en_attente, approuve, refuse, rembourse
            $table->decimal('montant_remboursement', 10, 2)->nullable();
            $table->text('decision_admin')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retours');
    }
};
