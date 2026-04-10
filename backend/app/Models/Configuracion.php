<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Configuracion extends Model
{
    protected $table = 'configuracion';
    protected $fillable = ['clave', 'valor'];

    //Metodo GET para obtener valor
    public static function get(string $clave, $default = null)
    {
        $registro = static::where('clave', $clave)->first();
        return $registro ? $registro->valor : $default;
    }

    //Metodo SET para guardar o actualizar valores
    public static function set(string $clave, $valor): void
    {
        static::updateOrCreate(['clave' => $clave], ['valor' => $valor]);
    }
}