<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fidelite_clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->integer('points')->default(0);
            $table->integer('total_points_gagnes')->default(0);
            $table->string('niveau')->default('bronze'); // bronze, argent, or, diamant
            $table->timestamps();

            $table->unique('client_id');
        });

        Schema::create('fidelite_historique', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->integer('points');
            $table->string('type'); // gain, redemption, expiration
            $table->string('description');
            $table->foreignId('commande_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fidelite_historique');
        Schema::dropIfExists('fidelite_clients');
    }
};
