<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Mochila extends Model { //Vincula la base de datos con el codigo. 
    protected $table = 'mochila';
    protected $fillable = ['user_identificador', 'item_id', 'cantidad'];

    //Permite que, tneiendo un registro en la mochila, pueda acceder a toda al informacion del objeto que contiene
    public function item() {
        return $this->belongsTo(Item::class);
    }
}