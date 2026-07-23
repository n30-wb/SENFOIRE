<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('livraisons', function (Blueprint $table) {
            $table->decimal('prix_livraison', 10, 2)->default(0)->after('statut');
            $table->decimal('distance_km', 8, 2)->default(0)->after('prix_livraison');
        });
    }

    public function down(): void
    {
        Schema::table('livraisons', function (Blueprint $table) {
            $table->dropColumn(['prix_livraison', 'distance_km']);
        });
    }
};
