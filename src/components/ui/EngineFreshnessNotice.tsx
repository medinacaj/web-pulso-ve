import type { EngineFreshness } from '@/lib/engine/freshness';

const DATE_TIME = new Intl.DateTimeFormat('es-VE', { timeZone: 'America/Caracas', dateStyle: 'medium', timeStyle: 'short' });

function duration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return minutes % 60 ? `${hours} h ${minutes % 60} min` : `${hours} h`;
  const days = Math.floor(hours / 24);
  return hours % 24 ? `${days} d ${hours % 24} h` : `${days} d`;
}

/**
 * Aviso cuando el motor de incidentes no se ha ejecutado o lleva demasiado sin
 * hacerlo (src/lib/engine/freshness.ts). No pinta nada con los datos al día.
 */
export function EngineFreshnessNotice({ freshness, className = 'mb-6' }: { freshness: EngineFreshness; className?: string }) {
  if (freshness.state === 'fresh') return null;
  return (
    <div role="status" className={`rounded-md border border-border border-l-4 border-l-status-elevated bg-surface px-4 py-3 ${className}`}>
      <p className="text-sm text-ink">
        {freshness.state === 'stale' && freshness.lastRunAt && freshness.minutesSinceRun !== null ? (
          <>
            <strong className="font-semibold">Datos desactualizados.</strong> El análisis de reportes no se ejecuta
            desde hace {duration(freshness.minutesSinceRun)} (último: {DATE_TIME.format(freshness.lastRunAt)}). Los
            incidentes y estados de esta página pueden no reflejar la situación actual.
          </>
        ) : (
          <>
            <strong className="font-semibold">Sin análisis todavía.</strong> El motor aún no ha procesado ningún
            periodo de reportes: no hay incidentes calculados.
          </>
        )}
      </p>
    </div>
  );
}
