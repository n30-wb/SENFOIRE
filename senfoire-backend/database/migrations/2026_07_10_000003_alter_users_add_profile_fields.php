<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('prenom')->nullable()->after('nom');
            $table->string('pseudo')->nullable()->after('prenom');
            $table->string('cni')->nullable()->after('pseudo');
            $table->string('photo_cni')->nullable()->after('cni');
            $table->date('date_naissance')->nullable()->after('photo_cni');
            $table->string('lieu_naissance')->nullable()->after('date_naissance');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['prenom', 'pseudo', 'cni', 'photo_cni', 'date_naissance', 'lieu_naissance']);
        });
    }
};
