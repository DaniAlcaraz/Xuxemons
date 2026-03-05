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
        Schema::create('xuxemons', function (Blueprint $table) {
            $table->id('IDxuxemon');
            $table->string('nombre');
            $table->enum('tipo', ['Agua', 'Tierra', 'Aire']);
            $table->enum('tamano', ['Pequeño', 'Mediano', 'Grande'])->default('Pequeño');
            $table->integer('evolucion_puntos')->default(0); //Contorla la transicion
            $table->string('archivo');
            $table->timestamps();
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
