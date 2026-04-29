<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Xuxemon extends Model
{
    protected $table = 'xuxemons'; //Tabla de la base de datos
    protected $primaryKey = 'IDxuxemon'; //Clave primaria personalizada (no usa id por defecto)

    protected $fillable = ['nombre', 'tipo', 'tamano', 'evolucion_puntos', 'archivo']; //Campos que se pueden asignar de forma masiva

    /**
     * Sube el tamaño del xuxemon al siguiente nivel.
     * Pequeño -> Mediano -> Grande (Grande no evoluciona más)
     */
    public function evolucionar()
    {
        if ($this->tamano === 'Pequeño') {
            $this->tamano = 'Mediano';
        } elseif ($this->tamano === 'Mediano') {
            $this->tamano = 'Grande';
        }
        return $this->save();
    }

    /**
     * Relación muchos a muchos con User.
     * Un xuxemon puede pertenecer a muchos usuarios
     * y un usuario puede tener muchos xuxemons.
     * 
     * Tabla pivot: xuxemon_usuario
     * FK local:    xuxemon_id     → IDxuxemon
     * FK foránea:  user_identificador → identificador
     */
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