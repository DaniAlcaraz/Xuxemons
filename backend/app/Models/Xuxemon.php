<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Xuxemon extends Model
{
    protected $table = 'xuxemons';
    
    // Decir a Laravel cómo se llama tu ID real
    protected $primaryKey = 'IDxuxemon';

    //Añadir evolucion_puntos para que te deje modificarlo en el futuro
    protected $fillable = ['nombre', 'tipo', 'tamano', 'evolucion_puntos', 'archivo'];

    // Lógica de transición de tamaño CORREGIDA
    public function evolucionar()
    {
        if ($this->tamano === 'Pequeño') {
            $this->tamano = 'Mediano'; // Cambiado de 'Medio' a 'Mediano'
        } elseif ($this->tamano === 'Mediano') { // Cambiado de 'Medio' a 'Mediano'
            $this->tamano = 'Grande';
        }
        
        return $this->save();
    }
}