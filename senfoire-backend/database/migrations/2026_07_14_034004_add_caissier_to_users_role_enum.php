<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'vendeur', 'client', 'livreur', 'caissier') NOT NULL DEFAULT 'client'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'vendeur', 'client', 'livreur') NOT NULL DEFAULT 'client'");
    }
};
