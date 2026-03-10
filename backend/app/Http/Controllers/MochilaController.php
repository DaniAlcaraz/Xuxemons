<?php
namespace App\Http\Controllers;
use App\Models\Item;
use App\Models\Mochila;
use Illuminate\Http\Request;

class MochilaController extends Controller {

    const MAX_ESPACIOS = 20;
    const MAX_STACK    = 5;

    // GET /mochila — mochila del usuario logueado
    public function index(Request $request) {
        $mochila = $request->user()
            ->mochila()
            ->with('item')
            ->get();
        return response()->json($mochila);
    }


    
    // GET /items — catálogo de ítems (para que el admin los vea)
    public function catalogoItems() {
        return response()->json(Item::all());
    }

    // POST /mochila/anadir — admin añade ítems a un usuario
    public function anadir(Request $request) {
        $request->validate([
            'user_identificador' => 'required|string|exists:usuarios,identificador',
            'item_id'            => 'required|integer|exists:items,id',
            'cantidad'           => 'required|integer|min:1',
        ]);

        $item     = Item::findOrFail($request->item_id);
        $mochila  = Mochila::where('user_identificador', $request->user_identificador)->with('item')->get();

        // Calcular espacios usados
        $espaciosUsados = $mochila->sum(function ($m) {
            return $m->item->tipo === 'xuxe'
                ? ceil($m->cantidad / self::MAX_STACK)
                : $m->cantidad;
        });
        $espaciosLibres = self::MAX_ESPACIOS - $espaciosUsados;

        if ($espaciosLibres <= 0) {
            return response()->json(['error' => 'La mochila del usuario está llena'], 400);
        }

        $entrada = Mochila::where('user_identificador', $request->user_identificador)
                          ->where('item_id', $request->item_id)
                          ->first();

        if ($item->tipo === 'xuxe') {
            $hueco  = $entrada ? (self::MAX_STACK - ($entrada->cantidad % self::MAX_STACK)) % self::MAX_STACK : 0;
            $caben  = $hueco + $espaciosLibres * self::MAX_STACK;
            $anadir = min($request->cantidad, $caben);
        } else {
            $anadir = min($request->cantidad, $espaciosLibres);
        }

        if ($entrada) {
            $entrada->cantidad += $anadir;
            $entrada->save();
        } else {
            Mochila::create([
                'user_identificador' => $request->user_identificador,
                'item_id'            => $request->item_id,
                'cantidad'           => $anadir,
            ]);
        }

        $descartados = $request->cantidad - $anadir;
        return response()->json([
            'message'     => 'Añadidos ' . $anadir . ' ' . $item->nombre . ($descartados > 0 ? ' (' . $descartados . ' descartados por espacio)' : ''),
            'añadidos'    => $anadir,
            'descartados' => $descartados,
        ]);
    }

    // POST /mochila/quitar — admin quita ítems de un usuario
    public function quitar(Request $request) {
        $request->validate([
            'user_identificador' => 'required|string|exists:usuarios,identificador',
            'item_id'            => 'required|integer|exists:items,id',
            'cantidad'           => 'required|integer|min:1',
        ]);

        $entrada = Mochila::where('user_identificador', $request->user_identificador)
                          ->where('item_id', $request->item_id)
                          ->first();

        if (!$entrada) return response()->json(['error' => 'El usuario no tiene ese ítem'], 404);

        $quitados = min($request->cantidad, $entrada->cantidad);
        $entrada->cantidad -= $quitados;
        if ($entrada->cantidad <= 0) $entrada->delete();
        else $entrada->save();

        return response()->json(['message' => 'Quitados ' . $quitados, 'quitados' => $quitados]);
    }

    
}