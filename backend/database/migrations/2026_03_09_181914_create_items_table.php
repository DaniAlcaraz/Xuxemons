<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
public function up(): void {
    
        //Migración para registrar un item creado
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->enum('tipo', ['xuxe', 'vacuna']);
            $table->string('descripcion')->nullable(); //Se puede dejar vacío
            $table->enum('rareza', ['común', 'raro', 'épico', 'legendario'])->default('común');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('items');
    }
};
