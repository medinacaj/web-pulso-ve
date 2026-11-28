/**
 * Cálculo puro de ventanas del motor (sin base de datos, para poder probarlo).
 *
 * La tarea programada procesa ventanas **cerradas**: una ventana en curso
 * agregada a mitad perdería los reportes que lleguen después de esa ejecución.
 */

/** Redondea hacia abajo al múltiplo de windowMinutes, para que ventanas consecutivas no se solapen. */
export function windowStartFor(date: Date, windowMinutes: number): Date {
  const ms = windowMinutes * 60_000;
  return new Date(Math.floor(date.getTime() / ms) * ms);
}

/** Inicio de la última ventana cerrada en `now`. */
export function lastCompletedWindowStart(now: Date, windowMinutes: number): Date {
  return new Date(windowStartFor(now, windowMinutes).getTime() - windowMinutes * 60_000);
}

/**
 * Ventanas cerradas que se recuperan de una vez si se perdieron ejecuciones del
 * cron (8 × 15 min = 2 h). El ciclo de incidentes exige ventanas consecutivas
 * (engine-window-continuity): un hueco por una ejecución perdida impediría abrir
 * un incidente real. Más atrás no se recupera: una ventana antigua ya no cambia el
 * estado actual y alargaría la ejecución en el hosting compartido.
 */
export const MAX_CATCH_UP_WINDOWS = 8;

/**
 * Ventanas a procesar, en orden cronológico: las cerradas posteriores a la última
 * procesada, hasta la última cerrada (como mucho `maxWindows`, las más recientes).
 * Sin pendientes devuelve [] (una ejecución duplicada no hace nada). Nunca
 * reprocesa una ventana anterior o igual a la última procesada.
 */
export function windowsToProcess(
  lastProcessedStart: Date | null,
  now: Date,
  windowMinutes: number,
  maxWindows: number = MAX_CATCH_UP_WINDOWS,
): Date[] {
  const target = lastCompletedWindowStart(now, windowMinutes).getTime();
  const step = windowMinutes * 60_000;
  if (!lastProcessedStart) return [new Date(target)];
  if (lastProcessedStart.getTime() >= target) return [];
  const first = Math.max(
    windowStartFor(lastProcessedStart, windowMinutes).getTime() + step,
    target - (maxWindows - 1) * step,
  );
  const out: Date[] = [];
  for (let t = first; t <= target; t += step) out.push(new Date(t));
  return out;
}
