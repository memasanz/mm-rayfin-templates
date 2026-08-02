import { entity, text, uuid } from '@microsoft/rayfin-core';

/**
 * A Contoso service line (practice). One row per practice; monthly figures
 * live in {@link PeriodMetrics}, linked back to a practice.
 *
 * No `@authenticated`/`@role` decorator is applied, so this entity uses
 * Rayfin's **default permissions**: any authenticated caller can read and
 * write. Tighten later with `@authenticated(...)` or `@role(...)` policies.
 */
@entity()
export class Practices {
  @uuid() id!: string;
  @text({ unique: true, max: 20 }) code!: string;
  @text({ max: 120 }) name!: string;
  @text({ max: 120 }) leader!: string;
  @text({ max: 60 }) region!: string;
}
