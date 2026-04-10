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


    //Permite añadir xuxes a la mochila del usuario poniendo un limite de stack 
    private function anadirConLimites(string $userIdentificador, Item $item, int $cantidad): array
    {
        $mochila = Mochila::where('user_identificador', $userIdentificador)->with('item')->get(); //Selecciona la mochila según el ID del usuario

        //Ocupan 1 espacio por cada MAX_STACK unidades
        //Ejemplo: Si un stack es de 50 y tengo 100 xuxes, entonces habrán dos stacks de 50.

        $espaciosUsados = $mochila->sum(function ($m) {
            return $m->item->tipo === 'xuxe'
                ? (int) ceil($m->cantidad / self::MAX_STACK)
                : (int) $m->cantidad;
        });

        //Si MAX_ESPACIOS = 100 y acumulo 80, me quedan 20 libres.
        $espaciosLibres = self::MAX_ESPACIOS - $espaciosUsados;

        //Si no hay espacio, rechaza todo
        if ($espaciosLibres <= 0) {
            return ['anadidos' => 0, 'descartados' => $cantidad];
        }

        //Busca si ya existe ese item en la mochila
        $entrada = Mochila::where('user_identificador', $userIdentificador)
            ->where('item_id', $item->id)
            ->first();

        if ($item->tipo === 'xuxe') {
            //Calcula cuantos items caben
            $hueco = $entrada ? (self::MAX_STACK - ($entrada->cantidad % self::MAX_STACK)) % self::MAX_STACK : 0;
            $caben = $hueco + $espaciosLibres * self::MAX_STACK;
            
            //Para otros items, que no apilan
            $anadir = min($cantidad, $caben);
        } else {
            $anadir = min($cantidad, $espaciosLibres);
        }

        //Si no cabe nada, rechaza
        if ($anadir <= 0) {
            return ['anadidos' => 0, 'descartados' => $cantidad];
        }

        //Actualiza o crea el registro
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

        //Devuelve el resultado
        return ['anadidos' => $anadir, 'descartados' => max(0, $cantidad - $anadir)];
    }

    // Regala xuxes diarios al usuario si toca, como un login diario en juegos.
    private function repartirXuxesDiariosSiToca(User $user): void
    {
        //Verifica si la función está habilitada (Si el usuario desactivó los xuxes diarios, se va).
        if (!$user->xuxes_diarios_activo) {
            return;
        }

        //Obtiene la configuración del usuario
        $cantidad = max(1, (int) ($user->xuxes_diarios_cantidad ?? 5));
        $horaConfig = (string) ($user->xuxes_diarios_hora ?? '09:00:00');
        $ahora = Carbon::now();
        $hoy = $ahora->toDateString();

        //Verifica si ya se repartió hoy (Si el último reparto fue hoy mismo, se va (evita múltiples repartos diarios))
        if ($user->xuxes_diarios_ultimo_reparto?->toDateString() === $hoy) {
            return;
        }

        //Verifica si ya pasó la hora de reparto
        $horaMinutos = substr($horaConfig, 0, 5);
        $instanteReparto = Carbon::createFromFormat('Y-m-d H:i', $hoy . ' ' . $horaMinutos);
        if ($ahora->lt($instanteReparto)) {
            return;
        }

        //Obtiene el item "xuxe" (Busca el item de tipo "xuxe" (si no existe, se va)).
        $itemXuxe = Item::where('tipo', 'xuxe')->orderBy('id')->first();
        if (!$itemXuxe) {
            return;
        }

        //Añade las xuxes a la mochila (Intenta añadir los xuxes con los límites de espacio que vimos antes.)
        $resultado = $this->anadirConLimites($user->identificador, $itemXuxe, $cantidad);

        //Si se añadireo, actualiza el registro (Marca que se repartió hoy para evitar duplicados mañana)
        if ($resultado['anadidos'] > 0) {
            $user->xuxes_diarios_ultimo_reparto = $hoy;
            $user->save();
        }
    }

    
}