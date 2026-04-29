<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {   
        //Registro para saber cuando se le aasigna un xuxemon a cada usuario (o si no se le asigna ninguno)
        Schema::table('usuarios', function (Blueprint $table) {
            $table->boolean('xuxemons_diarios_activo')->default(true)->after('xuxes_diarios_ultimo_reparto'); //Determina si el usuario tiene derecho a que le aparezca un Xuxemon salvaje cada dia.
            $table->time('xuxemons_diarios_hora')->default('09:00:00')->after('xuxemons_diarios_activo'); //Define a qué hora se descubre el Xuxemon diario para ese usuario (por defecto a las 9).
            $table->date('xuxemons_diarios_ultimo_descubrimiento')->nullable()->after('xuxemons_diarios_hora'); //Guarda la fecha de la ultima vez que le aparecio uno. Es el seguro para que no le salgan dos xuxmeons el mismo dia.
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
