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
        //Crea la tabla donde se registran los xuxemons del usuario
        Schema::create('xuxemon_usuario', function (Blueprint $table) {
            $table->id();
            $table->string('user_identificador'); //Almacena el ID del usuario
            $table->unsignedBigInteger('xuxemon_id'); //Almacena el ID del Xuxemon. Es de tipo entero largo sin signo para ser compatible con la clave primaria IDxuxemon del modelo Xuxemon.

            //La columna user_identificador hace referencia obligatoria a identificador en la tabla usuarios.
            $table->foreign('user_identificador')
                  ->references('identificador')
                  ->on('usuarios')
                  ->onDelete('cascade');

            //La columna xuxemon_id hace referencia obligatoria a IDxuxemon en la tabla xuxemons.
            $table->foreign('xuxemon_id')
                  ->references('IDxuxemon')
                  ->on('xuxemons')
                  
                  /* 
                   * Si borras a un usuario, Laravel borrará automáticamente todas sus filas en esta tabla. 
                   * Si borras un Xuxemon del juego, desaparecerá de la colección de todos los usuarios sin dejar errores.
                   */
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
