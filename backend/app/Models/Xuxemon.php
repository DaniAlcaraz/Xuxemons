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

    public function usuarios()
    {
        return $this->belongsToMany(
            User::class,
            'xuxemon_usuario',
            'xuxemon_id',
            'user_identificador',
            'IDxuxemon',
            'identificador'
        );
    }
}