<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        //Migracion o base para registrar un xuxemon creado
        Schema::create('xuxemons', function (Blueprint $table) {
            $table->id('IDxuxemon');
            $table->string('nombre');
            $table->enum('tipo', ['Agua', 'Tierra', 'Aire']); //Tipo, que puede ser agua, tierra o aire
            $table->enum('tamano', ['Pequeño', 'Mediano', 'Grande'])->default('Pequeño'); //Puede ser pequeño, mediano o grande, pero por defecto es pequeño
            $table->integer('evolucion_puntos')->default(0); //Contorla la transicion
            $table->string('archivo');
            $table->timestamps(); //Cuando se creo la tabla
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('xuxemons');
    }
};
