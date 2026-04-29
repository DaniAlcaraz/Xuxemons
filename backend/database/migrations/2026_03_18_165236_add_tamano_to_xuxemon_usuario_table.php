<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

    /*
     * Esta tabla permite que cada ejemplar sea único para el usuario que lo posee,
     * permitiendo que un mismo tipo de Xuxemon esté en diferentes etapas de crecimiento según quién sea su dueño.
     */
    public function up(): void
    {
        Schema::table('xuxemon_usuario', function (Blueprint $table) {
            $table->enum('tamano', ['Pequeño', 'Mediano', 'Grande']) //Crea una columna de tipo enumerado que solo acepta los valores: 'Pequeño', 'Mediano' o 'Grande'.
                  ->default('Pequeño') //Asegura que cualquier Xuxemon recién obtenido comience en su etapa inicial.
                  ->after('xuxemon_id'); //Es un detalle de orden estético en la base de datos para colocar la columna justo después del ID del Xuxemon.
            $table->integer('xuxes_acumuladas') //Crea un contador numérico
                  ->default(0)                  //que empieza en 0.
                  ->after('tamano');            //Para que obligatoriamente quede la columna de xuxes_acumuladas despues de a columna de tamaño
        });
    }

    public function down(): void
    {
        Schema::table('xuxemon_usuario', function (Blueprint $table) {
            $table->dropColumn(['tamano', 'xuxes_acumuladas']);
        });
    }
};