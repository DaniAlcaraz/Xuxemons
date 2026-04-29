<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        //
        Schema::create('coleccion', function (Blueprint $table) {
            $table->id(); //ID autoincremental
            $table->string('usuario_id'); // FK a usuarios.identificador (string)
            $table->unsignedBigInteger('xuxemon_id'); //Crea una columna numerica para el ID de Xuxemon. Coincide con el tipo IDxuxemon definido.
            $table->timestamps();

            //Vincula usuario_id con la columna identificador de la tabla usuarios.
            $table->foreign('usuario_id')
                  ->references('identificador')
                  ->on('usuarios')
                  ->onDelete('cascade');

            //Vincula xuxemon_id con la columna IDxuxemon de la tabla xuxemons.
            $table->foreign('xuxemon_id')
                  ->references('IDxuxemon')
                  ->on('xuxemons')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        /*
         * Este es un parámetro crítico. 
         * Si un usuario elimina su cuenta o un Xuxemon es borrado del sistema, 
         * todas las entradas relacionadas en la tabla coleccion se eliminarán 
         * automáticamente para evitar errores de base de datos.
         */
        
        Schema::dropIfExists('coleccion'); 
        
    }
};