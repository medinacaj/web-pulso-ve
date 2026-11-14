import type { OperationalStatus } from '../engine/status-bands';

/** Cero incidentes no acredita normalidad: conservar explícitamente la falta de datos. */
export function getOverviewStatus(statuses: OperationalStatus[], incidentsOpen: number): OperationalStatus {
  const priority: OperationalStatus[] = ['outage_high_confidence', 'outage_detected', 'possible_outage'];
  const incidentStatus = priority.find(status => statuses.includes(status));
  if (incidentStatus) return incidentStatus;
  if (incidentsOpen > 0) return 'possible_outage';
  for (const status of ['reports_elevated', 'slightly_elevated'] as const) {
    if (statuses.includes(status)) return status;
  }
  return statuses.length > 0 && statuses.every(status => status === 'normal') ? 'normal' : 'insufficient_data';
}
