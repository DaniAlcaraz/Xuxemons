<?php
namespace App\Http\Controllers;
use App\Models\Item;
use App\Models\Mochila;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Carbon;

class MochilaController extends Controller {

    const MAX_ESPACIOS = 20;
    const MAX_STACK    = 5;

    // GET /mochila — mochila del usuario logueado
    public function index(Request $request) {
        $this->repartirXuxesDiariosSiToca($request->user());

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
        $resultado = $this->anadirConLimites($request->user_identificador, $item, (int) $request->cantidad);

        if ($resultado['anadidos'] <= 0) {
            return response()->json(['error' => 'La mochila del usuario está llena'], 400);
        }
        return response()->json([
            'message'     => 'Añadidos ' . $resultado['anadidos'] . ' ' . $item->nombre . ($resultado['descartados'] > 0 ? ' (' . $resultado['descartados'] . ' descartados por espacio)' : ''),
            'añadidos'    => $resultado['anadidos'],
            'descartados' => $resultado['descartados'],
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

    private function anadirConLimites(string $userIdentificador, Item $item, int $cantidad): array
    {
        $mochila = Mochila::where('user_identificador', $userIdentificador)->with('item')->get();

        $espaciosUsados = $mochila->sum(function ($m) {
            return $m->item->tipo === 'xuxe'
                ? (int) ceil($m->cantidad / self::MAX_STACK)
                : (int) $m->cantidad;
        });
        $espaciosLibres = self::MAX_ESPACIOS - $espaciosUsados;

        if ($espaciosLibres <= 0) {
            return ['anadidos' => 0, 'descartados' => $cantidad];
        }

        $entrada = Mochila::where('user_identificador', $userIdentificador)
            ->where('item_id', $item->id)
            ->first();

        if ($item->tipo === 'xuxe') {
            $hueco = $entrada ? (self::MAX_STACK - ($entrada->cantidad % self::MAX_STACK)) % self::MAX_STACK : 0;
            $caben = $hueco + $espaciosLibres * self::MAX_STACK;
            $anadir = min($cantidad, $caben);
        } else {
            $anadir = min($cantidad, $espaciosLibres);
        }

        if ($anadir <= 0) {
            return ['anadidos' => 0, 'descartados' => $cantidad];
        }

        if ($entrada) {
            $entrada->cantidad += $anadir;
            $entrada->save();
        } else {
            Mochila::create([
                'user_identificador' => $userIdentificador,
                'item_id' => $item->id,
                'cantidad' => $anadir,
            ]);
        }

        return ['anadidos' => $anadir, 'descartados' => max(0, $cantidad - $anadir)];
    }

    private function repartirXuxesDiariosSiToca(User $user): void
    {
        if (!$user->xuxes_diarios_activo) {
            return;
        }

        $cantidad = max(1, (int) ($user->xuxes_diarios_cantidad ?? 5));
        $horaConfig = (string) ($user->xuxes_diarios_hora ?? '09:00:00');
        $ahora = Carbon::now();
        $hoy = $ahora->toDateString();

        if ($user->xuxes_diarios_ultimo_reparto?->toDateString() === $hoy) {
            return;
        }

        $horaMinutos = substr($horaConfig, 0, 5);
        $instanteReparto = Carbon::createFromFormat('Y-m-d H:i', $hoy . ' ' . $horaMinutos);
        if ($ahora->lt($instanteReparto)) {
            return;
        }

        $itemXuxe = Item::where('tipo', 'xuxe')->orderBy('id')->first();
        if (!$itemXuxe) {
            return;
        }

        $resultado = $this->anadirConLimites($user->identificador, $itemXuxe, $cantidad);
        if ($resultado['anadidos'] > 0) {
            $user->xuxes_diarios_ultimo_reparto = $hoy;
            $user->save();
        }
    }

    
}