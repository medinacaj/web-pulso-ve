import { max } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '@/lib/db/client';
import { aggregatedWindows } from '@/lib/db/schema';
import { engineFreshness, type EngineFreshness } from '@/lib/engine/freshness';

/** `created_at` más reciente de `aggregated_windows` (el ciclo inserta una fila por servicio activo, aunque tenga cero reportes). */
export async function getLastEngineRunAt(): Promise<Date | null> {
  const [row] = await db.select({ last: max(aggregatedWindows.createdAt) }).from(aggregatedWindows);
  return row?.last ?? null;
}

/** Frescura del motor, cacheada por petición (la usan aviso y página en el mismo render). */
export const getEngineFreshness = cache(async (): Promise<EngineFreshness> => engineFreshness(await getLastEngineRunAt()));
