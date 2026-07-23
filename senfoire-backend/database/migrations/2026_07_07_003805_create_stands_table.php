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
        Schema::create('stands', function (Blueprint $table) {
            $table->id();
            // La colonne essentielle reliant le stand à son vendeur
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade'); 
            $table->string('nom');
            $table->text('description')->nullable();
            $table->string('logo')->nullable();
            $table->string('localisation'); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stands');
    }
};