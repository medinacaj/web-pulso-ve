import { z } from 'zod';
import { TURNSTILE_TOKEN_MAX_LENGTH } from '@/lib/security/turnstile';

/**
 * Cuerpo de POST /api/reports. Corresponde a los campos del formulario del
 * brief (sección 8) que sí tienen columna en el esquema: no incluye
 * "consentimiento de privacidad" porque eso lo exige la UI antes de llamar
 * a este endpoint, no algo que la API pueda verificar por sí sola (ver
 * docs/00-PLAN-MAESTRO.md, registro de la Etapa 2).
 */
export const createReportSchema = z.object({
  serviceSlug: z.string().min(1).max(96),
  issueTypeSlug: z.string().min(1).max(64),
  stateCode: z
    .string()
    .regex(/^VE-[A-Z]$/, 'Código de estado inválido (formato esperado: VE-X)'),
  cityText: z.string().max(120).trim().optional(),
  networkCarrier: z.string().max(64).trim().optional(),
  comment: z.string().max(280).trim().optional(),
  // Generado y persistido por el cliente (p. ej. UUID en localStorage).
  // Nunca es un dato personal; ver src/lib/privacy.ts.
  deviceSeed: z.string().min(8).max(128),
  // Token del widget de Cloudflare Turnstile; solo se exige con ENABLE_TURNSTILE="true".
  turnstileToken: z.string().max(TURNSTILE_TOKEN_MAX_LENGTH).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
