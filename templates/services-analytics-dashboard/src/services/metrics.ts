import { getRayfinClient, isLocalBackend } from './rayfinClient';
import { generateMetrics } from '@/data/sampleData';

// Shape mirrors the `PeriodMetrics` entity in rayfin/data/PeriodMetrics.ts.
// `period` is a DateTime column on the backend, so GraphQL hydrates it back as a
// `Date` (not a string). `getMetrics` normalizes it to a `YYYY-MM-DD` string via
// `toPeriodString` so the rest of the app can rely on `period` being a string.
export interface Metric {
  id: string;
  practiceCode: string;
  period: string;
  fte: number;
  revenue: number;
  billableHours: number;
  utilization: number;
}

/**
 * Normalize a `period` value to the canonical `YYYY-MM-DD` string the app
 * expects. The Fabric backend stores `period` as a DateTime, so GraphQL hydrates
 * it back as a `Date` (or an ISO datetime string). Analytics and the trend chart
 * rely on `period` being a plain date string (used as Map keys, for `===`
 * comparisons, `.sort()`, and `.localeCompare()`). Without this, sorting throws
 * `period.localeCompare is not a function` and blanks the page.
 */
export function toPeriodString(value: unknown): string {
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, '0');
    const d = String(value.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  // Already a string: take the date portion (handles "YYYY-MM-DD" and
  // "YYYY-MM-DDTHH:mm:ssZ") to avoid timezone drift from re-parsing.
  return String(value).slice(0, 10);
}

// Local-dev in-memory fallback, seeded lazily from the bundled sample data.
let inMemory: Metric[] | null = null;

function seedInMemory(): Metric[] {
  if (inMemory) return inMemory;
  inMemory = generateMetrics().map((m, i) => ({
    id: `local-metric-${i}`,
    ...m,
  }));
  return inMemory;
}

export async function getMetrics(): Promise<Metric[]> {
  if (isLocalBackend()) {
    return [...seedInMemory()].sort((a, b) => a.period.localeCompare(b.period));
  }

  const client = getRayfinClient();
  const rows = await client.data.PeriodMetrics.select([
    'id',
    'practiceCode',
    'period',
    'fte',
    'revenue',
    'billableHours',
    'utilization',
  ])
    .orderBy({ period: 'asc' })
    .execute();
  return (rows as unknown as Metric[]).map((row) => ({
    ...row,
    period: toPeriodString(row.period),
  }));
}

/**
 * Bulk-create every sample metric row on a real backend, linking each to its
 * practice via the resolved `code -> id` map. Used only by the one-time
 * database seeder.
 */
export async function createSampleMetrics(
  practiceIdByCode: Map<string, string>
): Promise<void> {
  const client = getRayfinClient();
  for (const m of generateMetrics()) {
    const practiceId = practiceIdByCode.get(m.practiceCode);
    if (!practiceId) continue;
    await client.data.PeriodMetrics.create({
      practiceCode: m.practiceCode,
      period: new Date(m.period),
      fte: m.fte,
      revenue: m.revenue,
      billableHours: m.billableHours,
      utilization: m.utilization,
      practice: { id: practiceId },
    });
  }
}
