<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('avis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->cascadeOnDelete();
            $table->morphs('avisable');
            $table->tinyInteger('note')->unsigned();
            $table->text('commentaire')->nullable();
            $table->timestamps();

            $table->unique(['client_id', 'avisable_type', 'avisable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('avis');
    }
};
