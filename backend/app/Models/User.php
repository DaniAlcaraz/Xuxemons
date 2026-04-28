<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Models\Mochila;

class User extends Authenticatable
{
    use SoftDeletes, HasFactory, Notifiable, HasApiTokens;

    protected $table = 'usuarios';     //Indica que el modelo usa la tabla usuarios
    protected $primaryKey = 'identificador'; //Define la clave primaria
    public $incrementing = false; //Dice que esa clave no se incrementa
    protected $keyType = 'string'; //Indica que la clave primaria es de tipo texto.

    protected $fillable = [
        'identificador',
        'nombre',
        'apellidos',
        'email',
        'password',
        'rol',
        'xuxes_diarios_activo',
        'xuxes_diarios_cantidad',
        'xuxes_diarios_hora',
        'xuxes_diarios_ultimo_reparto',
        'xuxemons_diarios_activo',
        'xuxemons_diarios_hora',
        'xuxemons_diarios_ultimo_descubrimiento',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array // le dice a Laravel cómo convertir automáticamente los valores de ciertos campos cuando los lee o los guarda en el modelo.
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'xuxes_diarios_activo' => 'boolean',
            'xuxes_diarios_cantidad' => 'integer',
            'xuxes_diarios_ultimo_reparto' => 'date',
            'xuxemons_diarios_activo' => 'boolean',
            'xuxemons_diarios_ultimo_descubrimiento' => 'date',
        ];
    }

    public function mochila() { //Laravel usa user_identificador en la tabla de Mochila para buscar las filas que pertenecen al usuario cuyo identificador coincide.
        return $this->hasMany(Mochila::class, 'user_identificador', 'identificador');
    }

    public function xuxemons() { //define una relación muchos a muchos entre User y Xuxemon, usando la tabla intermedia xuxemon_usuario.
        return $this->belongsToMany(
            Xuxemon::class,
            'xuxemon_usuario',
            'user_identificador',
            'xuxemon_id',
            'identificador',
            'IDxuxemon'
        )

        //Además, incluye campos extra de esa tabla con withPivot() y también carga sus timestamps con withTimestamps().
        ->withPivot('tamano', 'xuxes_acumuladas', 'enfermo', 'enfermedad')
        ->withTimestamps();
    }
}