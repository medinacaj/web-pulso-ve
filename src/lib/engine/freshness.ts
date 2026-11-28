/**
 * Frescura del motor de incidentes. Si el cron deja de ejecutarlo, un incidente
 * abierto no puede cerrarse y las cifras dejan de moverse: las páginas lo avisan
 * en vez de presentarlas como actuales.
 */
export type EngineFreshnessState = 'never' | 'fresh' | 'stale';

export interface EngineFreshness {
  state: EngineFreshnessState;
  /** Momento del último ciclo (cuándo se ejecutó, no la ventana que procesó). */
  lastRunAt: Date | null;
  /** Minutos desde el último ciclo (null si nunca se ejecutó). */
  minutesSinceRun: number | null;
}

/**
 * Segundos sin un ciclo a partir de los cuales los datos se consideran
 * desactualizados. Por defecto 3600: con ventanas de 15 min son cuatro ventanas,
 * margen para un cron retrasado sin avisar por una sola ejecución perdida.
 * Configurable con ENGINE_FRESHNESS_SECONDS (900–10800), como
 * MONITOR_FRESHNESS_SECONDS en /api/health/monitoring.
 */
export function engineStaleAfterSeconds(raw = process.env.ENGINE_FRESHNESS_SECONDS): number {
  const value = Number(raw ?? 3600);
  return Number.isInteger(value) && value >= 900 && value <= 10800 ? value : 3600;
}

/** Puro (sin base de datos). Un reloj adelantado cuenta como reciente. */
export function engineFreshness(
  lastRunAt: Date | null,
  now: Date = new Date(),
  staleAfterSeconds: number = engineStaleAfterSeconds(),
): EngineFreshness {
  if (!lastRunAt) return { state: 'never', lastRunAt: null, minutesSinceRun: null };
  const seconds = Math.max(0, (now.getTime() - lastRunAt.getTime()) / 1000);
  return {
    state: seconds >= staleAfterSeconds ? 'stale' : 'fresh',
    lastRunAt,
    minutesSinceRun: Math.floor(seconds / 60),
  };
}
