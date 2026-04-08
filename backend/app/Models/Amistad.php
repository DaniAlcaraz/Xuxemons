<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Amistad extends Model
{
    protected $table = 'amistades';

    protected $fillable = [
        'solicitante_id',
        'receptor_id',
        'estado',
    ];

    // El usuario que envió la solicitud
    public function solicitante()
    {
        return $this->belongsTo(User::class, 'solicitante_id', 'identificador');
    }

    // El usuario que recibió la solicitud
    public function receptor()
    {
        return $this->belongsTo(User::class, 'receptor_id', 'identificador');
    }
}