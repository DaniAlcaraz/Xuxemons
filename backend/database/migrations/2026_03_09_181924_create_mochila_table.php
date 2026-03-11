<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{


public function up(): void {
    Schema::create('mochila', function (Blueprint $table) {
        $table->id();
        $table->string('user_identificador');
        $table->foreign('user_identificador')
              ->references('identificador')
              ->on('usuarios')
              ->onDelete('cascade');
        $table->foreignId('item_id')->constrained('items')->onDelete('cascade');
        $table->integer('cantidad')->default(1);
        $table->timestamps();
    });
}

public function down(): void {
    Schema::dropIfExists('mochila');
}
};
