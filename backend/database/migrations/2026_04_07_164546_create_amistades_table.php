<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('amistades', function (Blueprint $table) {
            $table->id();

            // Quien envía la solicitud
            $table->string('solicitante_id');
            $table->foreign('solicitante_id')
                  ->references('identificador')
                  ->on('usuarios')
                  ->onDelete('cascade');

            // Quien la recibe
            $table->string('receptor_id');
            $table->foreign('receptor_id')
                  ->references('identificador')
                  ->on('usuarios')
                  ->onDelete('cascade');

            // pending | accepted | rejected
            $table->enum('estado', ['pending', 'accepted', 'rejected'])->default('pending');

            $table->timestamps();

            // No puede haber dos solicitudes entre el mismo par
            $table->unique(['solicitante_id', 'receptor_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('amistades');
    }
};