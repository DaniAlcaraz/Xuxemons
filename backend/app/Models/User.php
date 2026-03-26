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

    protected $table = 'usuarios';
    protected $primaryKey = 'identificador';
    public $incrementing = false;
    protected $keyType = 'string';

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
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'xuxes_diarios_activo' => 'boolean',
            'xuxes_diarios_cantidad' => 'integer',
            'xuxes_diarios_ultimo_reparto' => 'date',
        ];
    }

    public function mochila() {
        return $this->hasMany(Mochila::class, 'user_identificador', 'identificador');
    }

    public function xuxemons() {
        return $this->belongsToMany(
            Xuxemon::class,
            'xuxemon_usuario',
            'user_identificador',
            'xuxemon_id',
            'identificador',
            'IDxuxemon'
        )
        ->withPivot('tamano', 'xuxes_acumuladas', 'enfermo', 'enfermedad')
        ->withTimestamps();
    }
}