import { entity, date, decimal, int, one, text, uuid } from '@microsoft/rayfin-core';
import { Practices } from './Practices.js';

/**
 * One monthly snapshot of a practice's people and financials. Charts and KPIs
 * on the dashboard aggregate these rows.
 *
 * Uses Rayfin's **default permissions** (no `@authenticated`/`@role`): any
 * authenticated caller can read and write.
 */
@entity()
export class PeriodMetrics {
  @uuid() id!: string;
  // Natural key of the owning practice — mirrors the `@one` relationship so
  // rows can be linked at load time (Practices.code -> Practices.id).
  @text({ max: 20 }) practiceCode!: string;
  // First day of the reporting month (e.g. 2025-01-01).
  @date() period!: Date;
  // Full-time-equivalent headcount for the month.
  @int() fte!: number;
  // Recognized revenue for the month, in USD.
  @decimal() revenue!: number;
  // Billable hours delivered in the month.
  @int() billableHours!: number;
  // Utilization as a whole-number percentage (0–100).
  @int() utilization!: number;

  @one(() => Practices) practice!: Practices;
}
