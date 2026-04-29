<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        //permite que las reglas del mundo Xuxemon (como cuantos dulces se necesitan para evolucionar) se puedan cambiar sin tener que tocar el codigo de la aplicacion.
        Schema::create('configuracion', function (Blueprint $table) {
            $table->id();
            $table->string('clave')->unique(); //Crea una columna para el nombre del ajuste. Al ser unique(), te aseguras de que no haya dos configuraciones llamadas igual (por ejemplo, no puede haber dos "precio_vacuna").
            $table->string('valor'); //Guarda el dato de esa configuracion. Se usa string para que sea flexible (puedes guardar números, palabras o incluso colores).
            $table->timestamps();
        });

        // Valores por defecto
        DB::table('configuracion')->insert([
            ['clave' => 'xuxes_pequeno_a_mediano', 'valor' => '3', 'created_at' => now(), 'updated_at' => now()],
            ['clave' => 'xuxes_mediano_a_grande',  'valor' => '5', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion');
    }
};
