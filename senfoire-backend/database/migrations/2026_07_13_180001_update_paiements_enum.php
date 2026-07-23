<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
return new class extends Migration {
    public function up(): void {
        DB::statement("ALTER TABLE paiements MODIFY COLUMN statut ENUM('succes', 'echoue', 'initie', 'en_attente') NOT NULL DEFAULT 'initie'");
    }
    public function down(): void {
        DB::statement("ALTER TABLE paiements MODIFY COLUMN statut ENUM('succes', 'echoue', 'initie') NOT NULL DEFAULT 'initie'");
    }
};
