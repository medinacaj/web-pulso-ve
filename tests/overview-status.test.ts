import { describe, expect, it } from 'vitest';
import { getOverviewStatus } from '../src/lib/presentation/overview-status';

describe('estado del resumen visible', () => {
  it('mantiene neutral un catálogo vacío o sin evidencia', () => {
    expect(getOverviewStatus([], 0)).toBe('insufficient_data');
    expect(getOverviewStatus(['insufficient_data'], 0)).toBe('insufficient_data');
    expect(getOverviewStatus(['normal', 'insufficient_data'], 0)).toBe('insufficient_data');
  });
  it('conserva las señales de riesgo aunque haya datos incompletos', () => {
    expect(getOverviewStatus(['reports_elevated', 'insufficient_data'], 0)).toBe('reports_elevated');
    expect(getOverviewStatus(['outage_detected', 'normal'], 0)).toBe('outage_detected');
    expect(getOverviewStatus(['normal'], 1)).toBe('possible_outage');
    expect(getOverviewStatus(['outage_high_confidence'], 1)).toBe('outage_high_confidence');
  });
  it('solo muestra normal cuando todos los servicios tienen ese estado', () => {
    expect(getOverviewStatus(['normal', 'normal'], 0)).toBe('normal');
  });
});
