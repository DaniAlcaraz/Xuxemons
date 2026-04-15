<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Mochila;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Carbon;

class MochilaController extends Controller {

    // Constantes para gestionar el peso y tamaño de la mochila
    const MAX_ESPACIOS = 20; // Capacidad total de la mochila
    const MAX_STACK    = 5;  // Cuántas 'xuxes' caben en un solo espacio (slot)

    /**
     * Muestra el inventario del usuario autenticado.
     * Antes de devolver los datos, comprueba si le toca recibir las xuxes diarias.
     */
    public function index(Request $request) {
        $this->repartirXuxesDiariosSiToca($request->user());

        $mochila = $request->user()
            ->mochila()
            ->with('item') // Carga la relación para saber qué objeto es (nombre, tipo, etc.)
            ->get();
            
        return response()->json($mochila);
    }

    /**
     * Devuelve todos los ítems disponibles en el juego.
     * Útil para que el administrador seleccione qué regalar o quitar.
     */
    public function catalogoItems() {
        return response()->json(Item::all());
    }

    /**
     * Endpoint para que el administrador añada ítems a la mochila de un usuario.
     * Valida existencia de usuario, ítem y que la cantidad sea positiva.
     */
    public function anadir(Request $request) {
        $request->validate([
            'user_identificador' => 'required|string|exists:usuarios,identificador',
            'item_id'            => 'required|integer|exists:items,id',
            'cantidad'           => 'required|integer|min:1',
        ]);

        $item = Item::findOrFail($request->item_id);
        
        // Ejecuta la lógica compleja de inserción respetando los límites de espacio
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

    /**
     * Permite al administrador quitar una cantidad específica de ítems a un usuario.
     * Si la cantidad llega a 0, elimina el registro de la tabla mochila.
     */
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

        // No podemos quitar más de lo que el usuario tiene
        $quitados = min($request->cantidad, $entrada->cantidad);
        $entrada->cantidad -= $quitados;
        
        if ($entrada->cantidad <= 0) {
            $entrada->delete();
        } else {
            $entrada->save();
        }

        return response()->json(['message' => 'Quitados ' . $quitados, 'quitados' => $quitados]);
    }

    /**
     * Lógica central de la Mochila: Calcula el espacio libre y gestiona el stacking.
     * Las 'xuxes' se apilan (5 por slot), las 'vacunas' ocupan 1 slot cada una.
     */
    private function anadirConLimites(string $userIdentificador, Item $item, int $cantidad): array
    {
        $mochila = Mochila::where('user_identificador', $userIdentificador)->with('item')->get();

        // Cálculo de espacios ocupados actualmente
        $espaciosUsados = $mochila->sum(function ($m) {
            return $m->item->tipo === 'xuxe'
                ? (int) ceil($m->cantidad / self::MAX_STACK) // Ejemplo: 7 xuxes = 2 slots
                : (int) $m->cantidad;                        // Ejemplo: 2 vacunas = 2 slots
        });
        
        $espaciosLibres = self::MAX_ESPACIOS - $espaciosUsados;

        if ($espaciosLibres <= 0) {
            return ['anadidos' => 0, 'descartados' => $cantidad];
        }

        $entrada = Mochila::where('user_identificador', $userIdentificador)
            ->where('item_id', $item->id)
            ->first();

        // Calcular cuántas unidades reales caben según el tipo de ítem
        if ($item->tipo === 'xuxe') {
            // Aprovecha el hueco del último slot incompleto + los slots vacíos
            $hueco = $entrada ? (self::MAX_STACK - ($entrada->cantidad % self::MAX_STACK)) % self::MAX_STACK : 0;
            $caben = $hueco + ($espaciosLibres * self::MAX_STACK);
            $anadir = min($cantidad, $caben);
        } else {
            // Las vacunas simplemente se limitan a los slots libres
            $anadir = min($cantidad, $espaciosLibres);
        }

        if ($anadir <= 0) {
            return ['anadidos' => 0, 'descartados' => $cantidad];
        }

        // Actualiza o crea el registro en la base de datos
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

    /**
     * Sistema de recompensas diarias.
     * Verifica si ha pasado el tiempo configurado por el admin y reparte las xuxes.
     */
    private function repartirXuxesDiariosSiToca(User $user): void
    {
        // Si el admin desactivó el reparto para este usuario, no hacemos nada
        if (!$user->xuxes_diarios_activo) return;

        $cantidad = max(1, (int) ($user->xuxes_diarios_cantidad ?? 5));
        $horaConfig = (string) ($user->xuxes_diarios_hora ?? '09:00:00');
        $ahora = Carbon::now();
        $hoy = $ahora->toDateString();

        // Si ya recibió el regalo hoy, salimos
        if ($user->xuxes_diarios_ultimo_reparto?->toDateString() === $hoy) return;

        // Comprobamos si ya hemos pasado la hora programada del día actual
        $horaMinutos = substr($horaConfig, 0, 5);
        $instanteReparto = Carbon::createFromFormat('Y-m-d H:i', $hoy . ' ' . $horaMinutos);
        
        if ($ahora->lt($instanteReparto)) return;

        // Buscamos el primer ítem tipo xuxe disponible para regalar
        $itemXuxe = Item::where('tipo', 'xuxe')->orderBy('id')->first();
        if (!$itemXuxe) return;

        // Intentamos añadir. Si tiene éxito, marcamos la fecha de último reparto
        $resultado = $this->anadirConLimites($user->identificador, $itemXuxe, $cantidad);
        if ($resultado['anadidos'] > 0) {
            $user->xuxes_diarios_ultimo_reparto = $hoy;
            $user->save();
        }
    }
}