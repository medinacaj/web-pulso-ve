/**
 * Ejecuta el motor de detección para todos los servicios activos: agrega,
 * recalcula líneas base, puntúa anomalías y actualiza el ciclo de vida de
 * incidentes (src/lib/engine/cycle.ts).
 *
 * Sin `--at` (modo cron): procesa las ventanas **cerradas** pendientes desde la
 * última procesada, en orden y como mucho MAX_CATCH_UP_WINDOWS
 * (src/lib/engine/windows.ts). Una ventana en curso no se toca: agregarla a mitad
 * perdería los reportes posteriores. Ejecutarlo dos veces seguidas no hace nada la
 * segunda, así que el cron puede ir cada 5 minutos (mínimo de Namecheap).
 *
 * Con `--at`: procesa exactamente la ventana que contiene esa fecha (pruebas y
 * tráfico sintético, como antes).
 *
 * Uso: npm run aggregate:run                         (cron)
 *      npm run aggregate:run -- --window=15 --at=2026-08-17T14:00:00Z
 * La programación del cron no se hace desde el código: ver docs/DESPLIEGUE-NAMECHEAP.md.
 */
import 'dotenv/config';
import { lastProcessedWindowStart, runEngineCycle } from '../src/lib/engine/cycle';
import { windowStartFor, windowsToProcess } from '../src/lib/engine/windows';

function parseArgs() {
  const args = process.argv.slice(2);
  const windowArg = args.find((a) => a.startsWith('--window='));
  const atArg = args.find((a) => a.startsWith('--at='));
  return {
    windowMinutes: windowArg ? Number(windowArg.split('=')[1]) : 15,
    at: atArg ? new Date(atArg.split('=')[1]) : null,
  };
}

async function main() {
  const { windowMinutes, at } = parseArgs();
  const log = (line: string) => console.log(line);

  if (at) {
    await runEngineCycle(windowStartFor(at, windowMinutes), windowMinutes, { baselineAt: at, log });
  } else {
    const pending = windowsToProcess(await lastProcessedWindowStart(), new Date(), windowMinutes);
    if (pending.length === 0) console.log('→ Sin ventanas cerradas pendientes.');
    for (const [i, windowStart] of pending.entries()) {
      // Las líneas base se recalculan una vez por ejecución, no por cada ventana recuperada.
      await runEngineCycle(windowStart, windowMinutes, { recompute: i === 0, log });
    }
  }

  console.log('✓ Ciclo completado.');
  process.exit(0);
}

main().catch((err) => {
  console.error('✗ Ciclo del motor falló:', err);
  process.exit(1);
});
