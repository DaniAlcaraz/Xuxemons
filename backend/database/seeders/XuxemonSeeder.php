<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Xuxemon;

class XuxemonSeeder extends Seeder
{
    public function run()
    {
        //Define aquí los Xuxemons iniciales
        $listaXuxemons = [
            ['nombre' => 'Apleki', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'apleki.png'],
            ['nombre' => 'Avecrem', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'avecrem.png'],
            ['nombre' => 'Bambino', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'bambino.png'],
            ['nombre' => 'Beeboo', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'beeboo.png'],
            ['nombre' => 'Boo-hoot', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'boo-hoot.png'],
            ['nombre' => 'Cabrales', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'cabrales.png'],
            ['nombre' => 'Catua', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'catua.png'],
            ['nombre' => 'Catyuska', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'catyuska.png'],
            ['nombre' => 'Chapapá', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'chapapa.png'],
            ['nombre' => 'Chopper', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'chopper.png'],
            ['nombre' => 'Cuellilargui', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'cuellilargui.png'],
            ['nombre' => 'Deskangoo', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'deskangoo.png'],
            ['nombre' => 'Doflamingo', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'doflamingo.png'],
            ['nombre' => 'Dolly', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'dolly.png'],
            ['nombre' => 'Elconchudo', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'elconchudo.png'],
            ['nombre' => 'Eldientes', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'eldientes.png'],
            ['nombre' => 'Elgominas', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'elgominas.png'],
            ['nombre' => 'Flipper', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'flipper.png'],
            ['nombre' => 'Floppi', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'floppi.png'],
            ['nombre' => 'Horseluis', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'horseluis.png'],
            ['nombre' => 'Krokolisko', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'krokolisko.png'],
            ['nombre' => 'Kurama', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'kurama.png'],
            ['nombre' => 'Ladybug', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'ladybug.png'],
            ['nombre' => 'Lengualargui', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'lengualargui.png'],
            ['nombre' => 'Medusation', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'medusation.png'],
            ['nombre' => 'Meekmeek', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'meekmeek.png'],
            ['nombre' => 'Megalo', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'megalo.png'],
            ['nombre' => 'Mocha', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'mocha.png'],
            ['nombre' => 'Murcimurci', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'murcimurci.png'],
            ['nombre' => 'Nemo', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'nemo.png'],
            ['nombre' => 'Oinkcelot', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'oinkcelot.png'],
            ['nombre' => 'Oreo', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'oreo.png'],
            ['nombre' => 'Otto', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'otto.png'],
            ['nombre' => 'Pinchimott', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'pinchimott.png'],
            ['nombre' => 'Pollis', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'pollis.png'],
            ['nombre' => 'Posón', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'poson.png'],
            ['nombre' => 'Quakko', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'quakko.png'],
            ['nombre' => 'Rajoy', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'rajoy.png'],
            ['nombre' => 'Rawlion', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'rawlion.png'],
            ['nombre' => 'Rexxo', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'rexxo.png'],
            ['nombre' => 'Ron', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'ron.png'],
            ['nombre' => 'Sesssi', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'sesssi.png'],
            ['nombre' => 'Shelly', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'shelly.png'],
            ['nombre' => 'Sirucco', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'sirucco.png'],
            ['nombre' => 'Torcas', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'torcas.png'],
            ['nombre' => 'Trompeta', 'tipo' => 'Aire', 'tamano' => 'Pequeño', 'archivo' => 'trompeta.png'],
            ['nombre' => 'Trompi', 'tipo' => 'Tierra', 'tamano' => 'Pequeño', 'archivo' => 'trompi.png'],
            ['nombre' => 'Tux', 'tipo' => 'Agua', 'tamano' => 'Pequeño', 'archivo' => 'tux.png']
        ];

        foreach ($listaXuxemons as $xuxemon) {
            Xuxemon::create($xuxemon);
        }
    }
}
