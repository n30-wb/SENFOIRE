<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alertes_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('produit_id')->constrained()->cascadeOnDelete();
            $table->boolean('declenchee')->default(false);
            $table->timestamp('declenchee_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'produit_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alertes_stock');
    }
};
