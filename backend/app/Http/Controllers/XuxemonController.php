<?php

namespace App\Http\Controllers;

use App\Models\Xuxemon;
use App\Models\User;
use App\Models\Mochila;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class XuxemonController extends Controller
{
    // Mapeo de qué vacuna cura qué enfermedad (* significa cura universal)
    private const VACUNA_CURA = [
        'Chocolatina'         => 'Bajón de azúcar',
        'Mermelada de frutas' => 'Atracón',
        'Insulina'            => '*', 
    ];

    // Probabilidades de infección al realizar acciones (alimentar/evolucionar)
    private const INFECCION = [
        'Bajón de azúcar'     => 5,  // 5% de probabilidad
        'Sobredosis de sucre' => 10, // 10%
        'Atracón'             => 15, // 15%
    ];

    /**
     * Lista de todos los Xuxemons base existentes.
     */
    public function index()
    {
        return response()->json(Xuxemon::all());
    }

    /**
     * Obtiene los Xuxemons específicos del usuario logueado.
     * Incluye datos de la tabla pivote (tamaño, xuxes comidas y estado de salud).
     */
    public function misXuxemons(Request $request)
    {
        // Antes de mostrar, comprobamos si le toca descubrir uno nuevo hoy
        $this->descubrirXuxemonDiarioSiToca($request->user());

        $xuxemons = $request->user()->xuxemons()->get()->map(function($x) {
            return [
                'IDxuxemon'        => $x->IDxuxemon,
                'nombre'           => $x->nombre,
                'tipo'             => $x->tipo,
                'tamano'           => $x->pivot->tamano,
                'xuxes_acumuladas' => $x->pivot->xuxes_acumuladas,
                'archivo'          => $x->archivo,
                'enfermo'          => (bool) $x->pivot->enfermo,
                'enfermedad'       => $x->pivot->enfermedad,
            ];
        });
        return response()->json($xuxemons);
    }

    /**
     * Lógica de curación: Valida que el usuario tenga la vacuna correcta
     * y ajusta las estadísticas del Xuxemon para que no haya errores visuales tras curar.
     */
    public function curarXuxemon(Request $request)
    {
        // ... validaciones de existencia de xuxemon y enfermedad ...

        $nombreVacuna     = $entradaMochila->item->nombre;
        $enfermedadActual = $xuxemon->pivot->enfermedad;
        $cura             = self::VACUNA_CURA[$nombreVacuna] ?? null;

        // Validar si la vacuna es efectiva contra la enfermedad actual
        if ($cura !== '*' && $cura !== $enfermedadActual) {
            return response()->json(['error' => 'Esta vacuna no cura "' . $enfermedadActual . '"'], 400);
        }

        // Consumo del ítem
        $entradaMochila->cantidad -= 1;
        $entradaMochila->cantidad <= 0 ? $entradaMochila->delete() : $entradaMochila->save();

        // Ajuste de Xuxes: Si el Xuxemon comió de más estando enfermo (ej. Bajón de azúcar),
        // al curarse le recortamos el exceso para que no evolucione "de golpe".
        $tamano = $xuxemon->pivot->tamano;
        $maxSinEnfermedad = $tamano === 'Pequeño' 
            ? (int) \App\Models\Configuracion::get('xuxes_pequeno_a_mediano', 3)
            : (int) \App\Models\Configuracion::get('xuxes_mediano_a_grande', 5);

        $xuxesAjustadas = min($xuxemon->pivot->xuxes_acumuladas, $maxSinEnfermedad - 1);

        $user->xuxemons()->updateExistingPivot($request->xuxemon_id, [
            'enfermo'          => false,
            'enfermedad'       => null,
            'xuxes_acumuladas' => $xuxesAjustadas,
        ]);

        return response()->json(['message' => '¡Curado con éxito!']);
    }

    /**
     * Lógica de alimentación y evolución.
     * Controla las restricciones por enfermedad (Atracón bloquea comida) 
     * y los modificadores (Bajón de azúcar pide más comida).
     */
    public function subirNivel(Request $request, $id)
    {
        $user  = $request->user();
        $pivot = $user->xuxemons()->where('xuxemons.IDxuxemon', $id)->first();

        // Restricción: Si tiene 'Atracón', no puede comer nada.
        if ($pivot->pivot->enfermo && $pivot->pivot->enfermedad === 'Atracón') {
            return response()->json(['error' => 'Este xuxemon tiene Atracón y no puede alimentarse'], 400);
        }

        $tamanoActual = $pivot->pivot->tamano;
        $xuxesNecesarias = $tamanoActual === 'Pequeño'
            ? (int) \App\Models\Configuracion::get('xuxes_pequeno_a_mediano', 3)
            : (int) \App\Models\Configuracion::get('xuxes_mediano_a_grande', 5);

        // Modificador: Bajón de azúcar aumenta la dificultad de evolución (+2 caramelos).
        if ($pivot->pivot->enfermo && $pivot->pivot->enfermedad === 'Bajón de azúcar') {
            $xuxesNecesarias += 2;
        }

        $xuxesAcumuladas = $pivot->pivot->xuxes_acumuladas + 1;

        // ¿Le toca evolucionar?
        if ($xuxesAcumuladas >= $xuxesNecesarias) {
            $nuevoTamano = $tamanoActual === 'Pequeño' ? 'Mediano' : 'Grande';
            
            $datosActualizar = ['tamano' => $nuevoTamano, 'xuxes_acumuladas' => 0];

            // Si llega a Grande, se cura automáticamente (premio por esfuerzo)
            if ($nuevoTamano === 'Grande') {
                $datosActualizar['enfermo'] = false;
                $datosActualizar['enfermedad'] = null;
            }

            $user->xuxemons()->updateExistingPivot($id, $datosActualizar);

            // Al comer/evolucionar, hay una probabilidad de volver a enfermarse
            if ($nuevoTamano !== 'Grande') {
                $this->intentarInfectar($user, Xuxemon::findOrFail($id));
            }

            return response()->json(['message' => "¡Evolucionó a $nuevoTamano!", 'evolucionado' => true]);
        } else {
            // No evoluciona, solo suma la xuxe comida
            $user->xuxemons()->updateExistingPivot($id, ['xuxes_acumuladas' => $xuxesAcumuladas]);
            $this->intentarInfectar($user, Xuxemon::findOrFail($id));
            
            return response()->json(['message' => 'Xuxe añadida', 'evolucionado' => false]);
        }
    }

    /**
     * Admin: Descubrir un xuxemon específico para un usuario.
     * Lo añade a la tabla pivote xuxemon_usuario en tamaño Pequeño.
     */
    public function anadirXuxemon(Request $request)
    {
        $request->validate([
            'user_identificador' => 'required|string',
            'xuxemon_id'         => 'required|integer',
        ]);

        $user = User::where('identificador', $request->user_identificador)->firstOrFail();
        $xuxemon = Xuxemon::findOrFail($request->xuxemon_id);

        // Comprobar si ya lo tiene descubierto
        if ($user->xuxemons()->where('xuxemons.IDxuxemon', $xuxemon->IDxuxemon)->exists()) {
            return response()->json(['error' => 'Este usuario ya tiene este xuxemon descubierto.'], 400);
        }

        $user->xuxemons()->attach($xuxemon->IDxuxemon, [
            'tamano'           => 'Pequeño',
            'xuxes_acumuladas' => 0,
            'enfermo'          => false,
            'enfermedad'       => null,
        ]);

        return response()->json(['message' => "¡{$xuxemon->nombre} descubierto!"]);
    }

    /**
     * Admin: Ocultar (quitar) un xuxemon de la colección de un usuario.
     */
    public function quitarXuxemon(Request $request)
    {
        $request->validate([
            'user_identificador' => 'required|string',
            'xuxemon_id'         => 'required|integer',
        ]);

        $user = User::where('identificador', $request->user_identificador)->firstOrFail();
        $user->xuxemons()->detach($request->xuxemon_id);

        return response()->json(['message' => 'Xuxemon ocultado correctamente.']);
    }

    /**
     * Admin: Descubrir un xuxemon aleatorio (no descubierto) para un usuario.
     */
    public function anadirAleatorio(Request $request)
    {
        $request->validate([
            'user_identificador' => 'required|string',
        ]);

        $user = User::where('identificador', $request->user_identificador)->firstOrFail();
        $descubiertos = $user->xuxemons()->pluck('xuxemons.IDxuxemon')->toArray();
        $noDescubiertos = Xuxemon::whereNotIn('IDxuxemon', $descubiertos)->get();

        if ($noDescubiertos->isEmpty()) {
            return response()->json(['error' => 'Este usuario ya ha descubierto todos los xuxemons.'], 400);
        }

        $aleatorio = $noDescubiertos->random();
        $user->xuxemons()->attach($aleatorio->IDxuxemon, [
            'tamano'           => 'Pequeño',
            'xuxes_acumuladas' => 0,
            'enfermo'          => false,
            'enfermedad'       => null,
        ]);

        return response()->json(['message' => "¡{$aleatorio->nombre} descubierto aleatoriamente!"]);
    }

    /**
     * Admin: Forzar una enfermedad a un xuxemon de un usuario.
     */
    public function enfermarXuxemon(Request $request)
    {
        $request->validate([
            'user_identificador' => 'required|string',
            'xuxemon_id'         => 'required|integer',
            'enfermedad'         => 'required|string',
        ]);

        $user = User::where('identificador', $request->user_identificador)->firstOrFail();
        $pivot = $user->xuxemons()->where('xuxemons.IDxuxemon', $request->xuxemon_id)->first();

        if (!$pivot) {
            return response()->json(['error' => 'Este usuario no tiene este xuxemon.'], 400);
        }

        $user->xuxemons()->updateExistingPivot($request->xuxemon_id, [
            'enfermo'    => true,
            'enfermedad' => $request->enfermedad,
        ]);

        return response()->json(['message' => 'Xuxemon enfermado con ' . $request->enfermedad]);
    }

    /**
     * Descubrimiento diario automático: Si el usuario tiene activado el
     * descubrimiento diario y ya es la hora, le descubre uno aleatorio.
     */
    private function descubrirXuxemonDiarioSiToca(User $user): void
    {
        if (!($user->xuxemons_diarios_activo ?? true)) return;

        $hora = $user->xuxemons_diarios_hora ?? '09:00:00';
        $ahora = Carbon::now();

        // Verificar que ya pasó la hora configurada
        $horaConfig = Carbon::today()->setTimeFromTimeString($hora);
        if ($ahora->lt($horaConfig)) return;

        // Verificar que no se haya hecho ya hoy
        $ultimoDesc = $user->xuxemons_diarios_ultimo_descubrimiento;
        if ($ultimoDesc && Carbon::parse($ultimoDesc)->isToday()) return;

        // Buscar un xuxemon no descubierto
        $descubiertos = $user->xuxemons()->pluck('xuxemons.IDxuxemon')->toArray();
        $noDescubiertos = Xuxemon::whereNotIn('IDxuxemon', $descubiertos)->get();

        if ($noDescubiertos->isEmpty()) return;

        $aleatorio = $noDescubiertos->random();
        $user->xuxemons()->attach($aleatorio->IDxuxemon, [
            'tamano'           => 'Pequeño',
            'xuxes_acumuladas' => 0,
            'enfermo'          => false,
            'enfermedad'       => null,
        ]);

        $user->xuxemons_diarios_ultimo_descubrimiento = Carbon::today();
        $user->save();
    }

    /**
     * Obtiene la configuración global de xuxes necesarias para evolucionar.
     */
    public function getConfigXuxes()
    {
        return response()->json([
            'xuxes_pequeno_a_mediano' => (int) Configuracion::get('xuxes_pequeno_a_mediano', 3),
            'xuxes_mediano_a_grande'  => (int) Configuracion::get('xuxes_mediano_a_grande', 5),
        ]);
    }

    /**
     * Actualiza la configuración global de xuxes necesarias para evolucionar.
     */
    public function setConfigXuxes(Request $request)
    {
        $request->validate([
            'xuxes_pequeno_a_mediano' => 'required|integer|min:1|max:99',
            'xuxes_mediano_a_grande'  => 'required|integer|min:1|max:99',
        ]);

        Configuracion::set('xuxes_pequeno_a_mediano', $request->xuxes_pequeno_a_mediano);
        Configuracion::set('xuxes_mediano_a_grande',  $request->xuxes_mediano_a_grande);

        return response()->json(['message' => 'Configuración de evolución actualizada.']);
    }
}