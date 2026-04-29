<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{

//Crea los registros de la tabla mochila en la base de datos.
//Crean registros donde se guardan los item que tiene un usuario en su mochila
public function up(): void {

    Schema::create('mochila', function (Blueprint $table) {
        $table->id(); //Clave primaria autoincremental
        $table->string('user_identificador'); //String que referencia al usuario dueño de la mochila
        $table->foreign('user_identificador') //FK de
              ->references('identificador')   //user_identificador
              ->on('usuarios')                //que apunta a usuarios
              ->onDelete('cascade');          //y si el usuario se borra, tabmien se borran sus item de mochila
        $table->foreignId('item_id')->constrained('items')->onDelete('cascade'); //Referencia al item que tiene en a mochila (FK a tabla items)
        $table->integer('cantidad')->default(1); //Cuantas unidades tiene de ese item (por defecto 1)
        $table->timestamps();
    });
}

public function down(): void {
    Schema::dropIfExists('mochila'); //Se elimina la creacion de esta tabla si ya existe.
}
};
