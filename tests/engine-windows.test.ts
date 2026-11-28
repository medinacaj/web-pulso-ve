import { describe, it, expect } from 'vitest';
import { lastCompletedWindowStart, MAX_CATCH_UP_WINDOWS, windowStartFor, windowsToProcess } from '../src/lib/engine/windows';

const iso = (ds: Date[]) => ds.map((d) => d.toISOString().slice(11, 16));

describe('motor: ventanas cerradas', () => {
  it('windowStartFor redondea hacia abajo al múltiplo de la ventana', () => {
    expect(windowStartFor(new Date('2026-11-28T10:14:59Z'), 15).toISOString()).toBe('2026-11-28T10:00:00.000Z');
    expect(windowStartFor(new Date('2026-11-28T10:15:00Z'), 15).toISOString()).toBe('2026-11-28T10:15:00.000Z');
  });

  it('un cron retrasado sigue procesando la ventana completa, nunca la que está en curso', () => {
    for (const at of ['2026-11-28T10:15:00Z', '2026-11-28T10:22:00Z', '2026-11-28T10:29:59Z']) {
      expect(lastCompletedWindowStart(new Date(at), 15).toISOString(), at).toBe('2026-11-28T10:00:00.000Z');
    }
  });
});

describe('motor: recuperación de ventanas perdidas', () => {
  const NOW = new Date('2026-11-28T12:05:00Z'); // última ventana cerrada: 11:45

  it('sin historia procesa solo la última ventana cerrada', () => {
    expect(iso(windowsToProcess(null, NOW, 15))).toEqual(['11:45']);
  });

  it('al día, o con una ejecución duplicada, no hace nada', () => {
    expect(windowsToProcess(new Date('2026-11-28T11:45:00Z'), NOW, 15)).toEqual([]);
    // Una ventana en curso procesada a mano (--at) tampoco provoca reprocesar una anterior.
    expect(windowsToProcess(new Date('2026-11-28T12:00:00Z'), NOW, 15)).toEqual([]);
  });

  it('tras ejecuciones perdidas recupera las pendientes en orden, sin huecos (continuidad de incidentes)', () => {
    expect(iso(windowsToProcess(new Date('2026-11-28T11:00:00Z'), NOW, 15))).toEqual(['11:15', '11:30', '11:45']);
  });

  it('tras una parada larga recupera como mucho las más recientes, consecutivas', () => {
    const out = windowsToProcess(new Date('2026-11-27T00:00:00Z'), NOW, 15);
    expect(out).toHaveLength(MAX_CATCH_UP_WINDOWS);
    expect(out.at(-1)!.toISOString()).toBe('2026-11-28T11:45:00.000Z');
    for (let i = 1; i < out.length; i++) expect(out[i].getTime() - out[i - 1].getTime()).toBe(15 * 60_000);
  });
});
