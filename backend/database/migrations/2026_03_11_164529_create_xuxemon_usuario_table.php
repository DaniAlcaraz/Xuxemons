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
        Schema::create('xuxemon_usuario', function (Blueprint $table) {
            $table->id();
            $table->string('user_identificador');
            $table->unsignedBigInteger('xuxemon_id');

            $table->foreign('user_identificador')
                  ->references('identificador')
                  ->on('usuarios')
                  ->onDelete('cascade');

            $table->foreign('xuxemon_id')
                  ->references('IDxuxemon')
                  ->on('xuxemons')
                  ->onDelete('cascade');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('xuxemon_usuario');
    }
};
