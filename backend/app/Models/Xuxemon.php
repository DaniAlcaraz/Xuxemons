<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Xuxemon extends Model
{
    protected $table = 'xuxemons';
    protected $primaryKey = 'IDxuxemon';

    protected $fillable = ['nombre', 'tipo', 'tamano', 'evolucion_puntos', 'archivo'];

    public function evolucionar()
    {
        if ($this->tamano === 'Pequeño') {
            $this->tamano = 'Mediano';
        } elseif ($this->tamano === 'Mediano') {
            $this->tamano = 'Grande';
        }
        return $this->save();
    }

    // Un xuxemon puede estar en la colección de muchos usuarios
    public function usuarios()
    {
        return $this->belongsToMany(
            User::class,
            'coleccion',
            'xuxemon_id',
            'usuario_id',
            'IDxuxemon',
            'identificador'
        );
    }
}