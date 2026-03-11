<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coleccion', function (Blueprint $table) {
            $table->id();
            $table->string('usuario_id'); // FK a usuarios.identificador (string)
            $table->unsignedBigInteger('xuxemon_id'); // FK a xuxemons.IDxuxemon
            $table->timestamps();

            $table->foreign('usuario_id')
                  ->references('identificador')
                  ->on('usuarios')
                  ->onDelete('cascade');

            $table->foreign('xuxemon_id')
                  ->references('IDxuxemon')
                  ->on('xuxemons')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coleccion');
    }
};