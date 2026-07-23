<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('commandes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade'); 
            $table->enum('statut', ['en_attente', 'payee', 'en_preparation', 'prete', 'en_cours_livraison', 'livree'])->default('en_attente');
            $table->decimal('montant_total', 10, 2);
            $table->decimal('montant_commission', 10, 2); 
            $table->enum('mode_paiement', ['wave', 'orange_money']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commandes');
    }
};