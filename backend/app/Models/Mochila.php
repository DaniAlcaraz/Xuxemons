<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Mochila extends Model {
    protected $table = 'mochila';
    protected $fillable = ['user_identificador', 'item_id', 'cantidad'];

    public function item() {
        return $this->belongsTo(Item::class);
    }
}