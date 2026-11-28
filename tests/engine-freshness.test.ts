import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { engineFreshness, engineStaleAfterSeconds } from '../src/lib/engine/freshness';
import { getLastEngineRunAt } from '../src/lib/queries/engine';
import { GET } from '../src/app/api/health/engine/route';

vi.mock('../src/lib/queries/engine', () => ({ getLastEngineRunAt: vi.fn(), getEngineFreshness: vi.fn() }));

const NOW = new Date('2026-11-28T12:00:00Z');
const ago = (min: number) => new Date(NOW.getTime() - min * 60_000);

describe('motor: frescura de los datos', () => {
  it('sin ningún ciclo, "never" (nunca "fresh")', () => {
    expect(engineFreshness(null, NOW)).toEqual({ state: 'never', lastRunAt: null, minutesSinceRun: null });
  });

  it('un retraso normal del cron no avisa; superar el umbral sí', () => {
    expect(engineFreshness(ago(29), NOW, 3600).state).toBe('fresh');
    expect(engineFreshness(ago(59), NOW, 3600).state).toBe('fresh');
    expect(engineFreshness(ago(60), NOW, 3600).state).toBe('stale');
    expect(engineFreshness(ago(60 * 72), NOW, 3600)).toMatchObject({ state: 'stale', minutesSinceRun: 4320 });
  });

  it('un reloj adelantado cuenta como reciente, sin minutos negativos', () => {
    expect(engineFreshness(new Date(NOW.getTime() + 120_000), NOW, 3600)).toMatchObject({ state: 'fresh', minutesSinceRun: 0 });
  });

  it('ENGINE_FRESHNESS_SECONDS fuera de rango vuelve al valor por defecto', () => {
    expect(engineStaleAfterSeconds(undefined)).toBe(3600);
    expect(engineStaleAfterSeconds('1800')).toBe(1800);
    for (const raw of ['60', '99999', 'abc', '1800.5']) expect(engineStaleAfterSeconds(raw), raw).toBe(3600);
  });

  it('las páginas con incidentes o estados llevan el aviso', () => {
    const app = join(process.cwd(), 'src', 'app');
    for (const page of ['page.tsx', 'servicios/page.tsx', 'servicios/[slug]/page.tsx', 'incidentes/page.tsx', 'estadisticas/page.tsx']) {
      const src = readFileSync(join(app, page), 'utf8');
      expect(src, page).toMatch(/<EngineFreshnessNotice\b/);
      expect(src, page).toMatch(/getEngineFreshness\(\)/);
    }
  });
});

describe('GET /api/health/engine', () => {
  const last = vi.mocked(getLastEngineRunAt);
  beforeEach(() => { last.mockReset(); });

  it('200 solo con un ciclo reciente, sin caché', async () => {
    last.mockResolvedValue(new Date(Date.now() - 5 * 60_000));
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('no-store');
    expect(await res.json()).toMatchObject({ component: 'incident_engine', status: 'ok', minutesSinceRun: 5 });
  });

  it('503 si el motor nunca se ejecutó o se detuvo', async () => {
    last.mockResolvedValue(null);
    expect((await GET()).status).toBe(503);
    last.mockResolvedValue(new Date(Date.now() - 3 * 3600_000));
    const res = await GET();
    expect(res.status).toBe(503);
    expect((await res.json()).status).toBe('stale');
  });

  it('503 sin filtrar el error interno si PostgreSQL falla', async () => {
    last.mockImplementation(async () => { throw new Error('postgresql://user:secret@db.internal/private'); });
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      const res = await GET();
      const body = await res.json();
      expect(res.status).toBe(503);
      expect(body.status).toBe('unavailable');
      expect(JSON.stringify(body)).not.toContain('secret');
    } finally {
      errorLog.mockRestore();
    }
  });
});
