<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Xuxemon extends Model
{
    protected $table = 'xuxemons';
    protected $fillable = ['nombre', 'tipo', 'tamano'];

    // Lógica de transición de tamaño
    public function evolucionar()
    {
        if ($this->tamano === 'Pequeño') {
            $this->tamano = 'Medio';
        } elseif ($this->tamano === 'Medio') {
            $this->tamano = 'Grande';
        }
        
        return $this->save();
    }
}
