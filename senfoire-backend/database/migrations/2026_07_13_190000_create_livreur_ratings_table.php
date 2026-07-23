<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('livreur_ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('livraison_id')->constrained()->cascadeOnDelete();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('livreur_id')->constrained('livreurs')->cascadeOnDelete();
            $table->integer('note')->unsigned()->between(1, 5);
            $table->text('commentaire')->nullable();
            $table->timestamps();
            $table->unique(['livraison_id', 'client_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('livreur_ratings');
    }
};
