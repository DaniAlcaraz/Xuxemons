<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->boolean('xuxes_diarios_activo')->default(true)->after('rol'); //Registra si el usuario indicado recibe xuxes (true) o no (false). Aparte busca la columna rol para verificar que el usuario sea admin y por lo tanto tenga permitido hacer esos cambios.
            $table->unsignedInteger('xuxes_diarios_cantidad')->default(5)->after('xuxes_diarios_activo'); //El numero de dulces (por defecto 5). Esto permite que, por ejemplo, los usuarios VIP reciban más dulces que los normales.
            $table->time('xuxes_diarios_hora')->default('09:00:00')->after('xuxes_diarios_cantidad'); //La hora programada (por defecto las 09:00:00). El servidor consultará esta columna para saber cuándo debe disparar la entrega.
            $table->date('xuxes_diarios_ultimo_reparto')->nullable()->after('xuxes_diarios_hora'); //Una fecha. Asi el sistema no entregue el premio dos veces el mismo dia. Si hoy ya recibio dulces, el sistema ve esta fecha y no le da mas hasta mañana.
        });
    }

    public function down(): void
    {
        Schema::table('usuarios', function (Blueprint $table) {
            $table->dropColumn([ //ELimina las columnas si existen ya
                'xuxes_diarios_activo',
                'xuxes_diarios_cantidad',
                'xuxes_diarios_hora',
                'xuxes_diarios_ultimo_reparto',
            ]);
        });
    }
};
