<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Coleccion extends Model
{
    protected $table = 'coleccion';

    protected $fillable = ['usuario_id', 'xuxemon_id'];

    //Relación con xuxemon
    public function xuxemon()
    {
        return $this->belongsTo(Xuxemon::class, 'xuxemon_id', 'IDxuxemon');
    }

    //Relación con usuario
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id', 'identificador');
    }
}