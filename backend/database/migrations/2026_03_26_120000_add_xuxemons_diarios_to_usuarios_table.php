<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->boolean('xuxemons_diarios_activo')->default(true)->after('xuxes_diarios_ultimo_reparto');
            $table->time('xuxemons_diarios_hora')->default('09:00:00')->after('xuxemons_diarios_activo');
            $table->date('xuxemons_diarios_ultimo_descubrimiento')->nullable()->after('xuxemons_diarios_hora');
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn([
                'xuxemons_diarios_activo',
                'xuxemons_diarios_hora',
                'xuxemons_diarios_ultimo_descubrimiento',
            ]);
        });
    }
};
