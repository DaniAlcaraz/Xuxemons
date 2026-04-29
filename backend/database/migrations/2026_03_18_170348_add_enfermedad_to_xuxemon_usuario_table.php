<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('xuxemon_usuario', function (Blueprint $table) {
            $table->boolean('enfermo')->default(false)->after('xuxemon_id'); //Crea un interruptor (0 o 1). Por defecto es false (0), lo que significa que el Xuxemon nace sano. Se coloca justo despues del ID para que sea lo primero que veas al revisar su estado.
            $table->string('enfermedad')->nullable()->after('enfermo'); //Crea un campo de texto para poner el nombre del malestar (ej. "Bajon de azucar"). Se puede dejar vacio porque si el Xuxemon esta sano, este campo estará vacío (NULL).
        });
    }

    public function down(): void
    {
        Schema::table('xuxemon_usuario', function (Blueprint $table) {
            $table->dropColumn(['enfermo', 'enfermedad']);
        });
    }
};