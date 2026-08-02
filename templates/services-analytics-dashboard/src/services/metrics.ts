import { getRayfinClient, isLocalBackend } from './rayfinClient';
import { generateMetrics } from '@/data/sampleData';

// Shape mirrors the `PeriodMetrics` entity in rayfin/data/PeriodMetrics.ts.
// `period` comes back from GraphQL as an ISO string.
export interface Metric {
  id: string;
  practiceCode: string;
  period: string;
  fte: number;
  revenue: number;
  billableHours: number;
  utilization: number;
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
  return rows as unknown as Metric[];
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
