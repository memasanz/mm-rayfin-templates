import { describe, expect, it } from 'vitest';

import { latestPeriod, revenueTrend } from '@/services/analytics';
import { type Metric, toPeriodString } from '@/services/metrics';

/**
 * Guards the `period` normalization contract independently of the bundled
 * sample data. The Fabric backend stores `period` as a DateTime, so GraphQL
 * hydrates it back as a `Date` (or ISO datetime string) — but analytics treats
 * `period` as a `YYYY-MM-DD` string (Map keys, `===`, `.sort()`,
 * `.localeCompare()`). Without normalization this throws
 * `period.localeCompare is not a function` and blanks the page.
 *
 * These tests use a tiny inline fixture (not `generateMetrics()`), so they
 * remain valid after you replace the sample data with your own.
 */
describe('period normalization', () => {
  it('normalizes Date and ISO string periods to YYYY-MM-DD', () => {
    expect(toPeriodString(new Date('2025-06-01T00:00:00Z'))).toBe('2025-06-01');
    expect(toPeriodString('2025-06-01T00:00:00.000Z')).toBe('2025-06-01');
    expect(toPeriodString('2025-06-01')).toBe('2025-06-01');
  });

  it('collapses backend-shaped (Date) periods into one point per month', () => {
    // Rows shaped like the backend returns them: `period` as a Date object.
    const make = (period: string, practiceCode: string, revenue: number, fte: number): Metric => ({
      id: `${practiceCode}-${period}`,
      practiceCode,
      period: toPeriodString(new Date(`${period}T00:00:00Z`)),
      fte,
      revenue,
      billableHours: 0,
      utilization: 0,
    });

    const rows: Metric[] = [
      make('2024-01-01', 'A', 100, 5),
      make('2024-01-01', 'B', 50, 3),
      make('2024-02-01', 'A', 200, 6),
    ];

    // Must not throw (the original bug) and must group by month, sorted asc.
    const trend = revenueTrend(rows);
    expect(trend.map((t) => t.period)).toEqual(['2024-01-01', '2024-02-01']);
    expect(trend[0]).toMatchObject({ revenue: 150, fte: 8 });
    expect(latestPeriod(rows)).toBe('2024-02-01');
  });
});
