<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class XuxemonController extends Controller
{
    public function subirNivel($id) {
        $xuxemon = Xuxemon::findOrFail($id);
        
        // Llamamos al método que creamos en el modelo
        $xuxemon->evolucionar();

        return response()->json([
            'message' => '¡El Xuxemon ha evolucionado!',
            'xuxemon' => $xuxemon
    ]);
}
}
