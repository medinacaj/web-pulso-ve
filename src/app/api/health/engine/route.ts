import { getLastEngineRunAt } from '@/lib/queries/engine';
import { engineFreshness, engineStaleAfterSeconds } from '@/lib/engine/freshness';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const headers = { 'Cache-Control': 'private, no-store, max-age=0' };

function json(status: string, data: Record<string, unknown>, code: number) {
  return Response.json({ component: 'incident_engine', status, ...data }, { status: code, headers });
}

/**
 * Evidencia de que el cron del motor (`npm run aggregate:run`) se ejecuta: 200 solo
 * con un ciclo dentro de ENGINE_FRESHNESS_SECONDS; 503 si nunca se ejecutó, si se
 * detuvo o si PostgreSQL falla. No es una señal de disponibilidad de ningún servicio.
 */
export async function GET(): Promise<Response> {
  const checkedAt = new Date().toISOString();
  const freshnessSeconds = engineStaleAfterSeconds();
  try {
    const f = engineFreshness(await getLastEngineRunAt(), new Date(), freshnessSeconds);
    const status = f.state === 'fresh' ? 'ok' : f.state;
    return json(status, {
      checkedAt,
      lastRunAt: f.lastRunAt?.toISOString() ?? null,
      minutesSinceRun: f.minutesSinceRun,
      freshnessSeconds,
    }, status === 'ok' ? 200 : 503);
  } catch {
    console.error('PulsoVE: no fue posible verificar la frescura del motor');
    return json('unavailable', { checkedAt }, 503);
  }
}
