import type { Metric } from '@/services/metrics';
import type { Practice } from '@/services/practices';

export interface Kpis {
  totalFte: number;
  totalRevenue: number;
  revenuePerFte: number;
  avgUtilization: number;
}

export interface TrendPoint {
  period: string;
  revenue: number;
  fte: number;
}

export interface PracticeRollup {
  code: string;
  name: string;
  region: string;
  leader: string;
  fte: number;
  revenue: number;
  utilization: number;
}

/** The most recent period present in the data, or null when empty. */
export function latestPeriod(metrics: Metric[]): string | null {
  if (metrics.length === 0) return null;
  return metrics.reduce((max, m) => (m.period > max ? m.period : max), metrics[0].period);
}

/**
 * Headline KPIs. FTE and utilization reflect the latest month; revenue is the
 * trailing 12 months (or all available months when fewer exist).
 */
export function computeKpis(metrics: Metric[]): Kpis {
  const latest = latestPeriod(metrics);
  if (!latest) {
    return { totalFte: 0, totalRevenue: 0, revenuePerFte: 0, avgUtilization: 0 };
  }

  const latestRows = metrics.filter((m) => m.period === latest);
  const totalFte = latestRows.reduce((s, m) => s + m.fte, 0);
  const avgUtilization =
    latestRows.length === 0
      ? 0
      : Math.round(
          latestRows.reduce((s, m) => s + m.utilization, 0) / latestRows.length
        );

  const periods = [...new Set(metrics.map((m) => m.period))].sort();
  const trailing = new Set(periods.slice(-12));
  const totalRevenue = metrics
    .filter((m) => trailing.has(m.period))
    .reduce((s, m) => s + m.revenue, 0);

  const revenuePerFte = totalFte === 0 ? 0 : Math.round(totalRevenue / totalFte);

  return { totalFte, totalRevenue, revenuePerFte, avgUtilization };
}

/** Total revenue and FTE per month, sorted ascending by period. */
export function revenueTrend(metrics: Metric[]): TrendPoint[] {
  const byPeriod = new Map<string, TrendPoint>();
  for (const m of metrics) {
    const point = byPeriod.get(m.period) ?? {
      period: m.period,
      revenue: 0,
      fte: 0,
    };
    point.revenue += m.revenue;
    point.fte += m.fte;
    byPeriod.set(m.period, point);
  }
  return [...byPeriod.values()].sort((a, b) => a.period.localeCompare(b.period));
}

/** Latest-month rollup per practice, joined with practice metadata. */
export function practiceRollups(
  practices: Practice[],
  metrics: Metric[]
): PracticeRollup[] {
  const latest = latestPeriod(metrics);
  const rollups: PracticeRollup[] = [];

  for (const p of practices) {
    const row = metrics.find(
      (m) => m.practiceCode === p.code && m.period === latest
    );
    rollups.push({
      code: p.code,
      name: p.name,
      region: p.region,
      leader: p.leader,
      fte: row?.fte ?? 0,
      revenue: row?.revenue ?? 0,
      utilization: row?.utilization ?? 0,
    });
  }

  return rollups.sort((a, b) => b.revenue - a.revenue);
}
