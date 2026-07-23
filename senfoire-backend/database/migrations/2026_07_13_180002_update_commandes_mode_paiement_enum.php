<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
return new class extends Migration {
    public function up(): void {
        DB::statement("ALTER TABLE commandes MODIFY COLUMN mode_paiement ENUM('wave', 'orange_money', 'especes') NOT NULL");
    }
    public function down(): void {
        DB::statement("ALTER TABLE commandes MODIFY COLUMN mode_paiement ENUM('wave', 'orange_money') NOT NULL");
    }
};
