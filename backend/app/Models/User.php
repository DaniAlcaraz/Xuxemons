<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'rol'
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
        ];
    }

    // Un usuario puede tener muchos xuxemons en su colección (con repetidos)
    public function coleccion()
    {
        return $this->hasMany(Coleccion::class, 'usuario_id', 'identificador');
    }

    public function xuxemons()
    {
        return $this->belongsToMany(
            Xuxemon::class,
            'coleccion',
            'usuario_id',
            'xuxemon_id',
            'identificador',
            'IDxuxemon'
        );
    }
}