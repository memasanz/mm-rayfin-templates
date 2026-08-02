import { describe, expect, it } from 'vitest';

import { generateMetrics, PRACTICES } from '@/data/sampleData';
import {
  computeKpis,
  latestPeriod,
  practiceRollups,
  revenueTrend,
} from '@/services/analytics';
import type { Metric } from '@/services/metrics';
import type { Practice } from '@/services/practices';

const metrics: Metric[] = generateMetrics().map((m, i) => ({
  id: `m-${i}`,
  ...m,
}));

const practices: Practice[] = PRACTICES.map((p) => ({
  id: `p-${p.code}`,
  code: p.code,
  name: p.name,
  leader: p.leader,
  region: p.region,
}));

describe('sample data', () => {
  it('produces 18 months per practice', () => {
    expect(metrics.length).toBe(PRACTICES.length * 18);
  });

  it('is deterministic across calls', () => {
    expect(generateMetrics()).toEqual(generateMetrics());
  });

  it('keeps revenue consistent with billable hours and rate', () => {
    // revenue == round(billableHours * ratePerHour) for each row
    const rateByCode = new Map(PRACTICES.map((p) => [p.code, p.ratePerHour]));
    for (const m of metrics) {
      const rate = rateByCode.get(m.practiceCode)!;
      expect(m.revenue).toBe(Math.round(m.billableHours * rate));
    }
  });

  it('keeps utilization within a sane band', () => {
    for (const m of metrics) {
      expect(m.utilization).toBeGreaterThanOrEqual(58);
      expect(m.utilization).toBeLessThanOrEqual(94);
    }
  });
});

describe('analytics helpers', () => {
  it('finds the latest period', () => {
    expect(latestPeriod(metrics)).toBe('2025-06-01');
    expect(latestPeriod([])).toBeNull();
  });

  it('computes non-negative KPIs derived from the latest month', () => {
    const kpis = computeKpis(metrics);
    const latest = latestPeriod(metrics);
    const expectedFte = metrics
      .filter((m) => m.period === latest)
      .reduce((s, m) => s + m.fte, 0);

    expect(kpis.totalFte).toBe(expectedFte);
    expect(kpis.totalRevenue).toBeGreaterThan(0);
    expect(kpis.revenuePerFte).toBeGreaterThan(0);
    expect(kpis.avgUtilization).toBeGreaterThan(0);
  });

  it('returns empty KPIs for no data', () => {
    expect(computeKpis([])).toEqual({
      totalFte: 0,
      totalRevenue: 0,
      revenuePerFte: 0,
      avgUtilization: 0,
    });
  });

  it('aggregates a sorted monthly revenue trend', () => {
    const trend = revenueTrend(metrics);
    expect(trend.length).toBe(18);
    const periods = trend.map((t) => t.period);
    expect(periods).toEqual([...periods].sort());
    expect(trend.every((t) => t.revenue > 0)).toBe(true);
  });

  it('rolls up one row per practice, sorted by revenue desc', () => {
    const rollups = practiceRollups(practices, metrics);
    expect(rollups.length).toBe(PRACTICES.length);
    for (let i = 1; i < rollups.length; i++) {
      expect(rollups[i - 1].revenue).toBeGreaterThanOrEqual(rollups[i].revenue);
    }
  });
});
