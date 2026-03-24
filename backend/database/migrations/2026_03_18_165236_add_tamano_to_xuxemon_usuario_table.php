<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('xuxemon_usuario', function (Blueprint $table) {
            $table->enum('tamano', ['Pequeño', 'Mediano', 'Grande'])
                  ->default('Pequeño')
                  ->after('xuxemon_id');
            $table->integer('xuxes_acumuladas')
                  ->default(0)
                  ->after('tamano');
        });
    }

    public function down(): void
    {
        Schema::table('xuxemon_usuario', function (Blueprint $table) {
            $table->dropColumn(['tamano', 'xuxes_acumuladas']);
        });
    }
};