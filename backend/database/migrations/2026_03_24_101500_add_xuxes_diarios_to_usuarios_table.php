<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->boolean('xuxes_diarios_activo')->default(true)->after('rol');
            $table->unsignedInteger('xuxes_diarios_cantidad')->default(5)->after('xuxes_diarios_activo');
            $table->time('xuxes_diarios_hora')->default('09:00:00')->after('xuxes_diarios_cantidad');
            $table->date('xuxes_diarios_ultimo_reparto')->nullable()->after('xuxes_diarios_hora');
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn([
                'xuxes_diarios_activo',
                'xuxes_diarios_cantidad',
                'xuxes_diarios_hora',
                'xuxes_diarios_ultimo_reparto',
            ]);
        });
    }
};
