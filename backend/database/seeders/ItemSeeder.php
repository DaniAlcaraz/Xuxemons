<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Item;

class ItemSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Item::truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        Item::insert([
            ['nombre'=>'Xuxe Roja',           'tipo'=>'xuxe',   'descripcion'=>'Xuxe básica roja',                             'rareza'=>'común',  'created_at'=>now(),'updated_at'=>now()],
            ['nombre'=>'Xuxe Azul',           'tipo'=>'xuxe',   'descripcion'=>'Xuxe básica azul',                             'rareza'=>'raro',   'created_at'=>now(),'updated_at'=>now()],
            ['nombre'=>'Xuxe Dorada',         'tipo'=>'xuxe',   'descripcion'=>'Xuxe especial dorada',                         'rareza'=>'épico',  'created_at'=>now(),'updated_at'=>now()],
            ['nombre'=>'Chocolatina',         'tipo'=>'vacuna', 'descripcion'=>'Causa Bajón de azúcar al usarla en un Xuxemon','rareza'=>'común',  'created_at'=>now(),'updated_at'=>now()],
            ['nombre'=>'Mermelada de frutas', 'tipo'=>'vacuna', 'descripcion'=>'Causa Atracón al usarla en un Xuxemon',        'rareza'=>'común',  'created_at'=>now(),'updated_at'=>now()],
            ['nombre'=>'Insulina',            'tipo'=>'vacuna', 'descripcion'=>'Cura todas las enfermedades de un Xuxemon',    'rareza'=>'épico',  'created_at'=>now(),'updated_at'=>now()],
        ]);
    }
}