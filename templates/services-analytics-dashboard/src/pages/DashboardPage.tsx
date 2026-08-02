import { useCallback, useEffect, useMemo, useState } from 'react';

import { HorizontalBarChart } from '@/components/HorizontalBarChart';
import { RevenueTrendChart } from '@/components/RevenueTrendChart';
import { useAuth } from '@/hooks/AuthContext';
import {
  computeKpis,
  practiceRollups,
  revenueTrend,
} from '@/services/analytics';
import type { Metric } from '@/services/metrics';
import type { Practice } from '@/services/practices';
import { ensureSeeded, getMetrics, getPractices } from '@/services/seed';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const compactUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const card = 'border border-gray-200 bg-white shadow-sm';

export function DashboardPage() {
  const { signOut, user } = useAuth();
  const [practices, setPractices] = useState<Practice[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      await ensureSeeded();
      const [p, m] = await Promise.all([getPractices(), getMetrics()]);
      setPractices(p);
      setMetrics(m);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const kpis = useMemo(() => computeKpis(metrics), [metrics]);
  const trend = useMemo(() => revenueTrend(metrics), [metrics]);
  const rollups = useMemo(
    () => practiceRollups(practices, metrics),
    [practices, metrics]
  );

  const revenueByPractice = useMemo(
    () => rollups.map((r) => ({ label: r.code, value: r.revenue })),
    [rollups]
  );
  const fteByPractice = useMemo(
    () =>
      [...rollups]
        .sort((a, b) => b.fte - a.fte)
        .map((r) => ({ label: r.code, value: r.fte })),
    [rollups]
  );

  return (
    <div className="min-h-screen bg-white text-brand-ink">
      <header className="sticky top-0 z-20 bg-brand-deep">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <ContosoMark />
            <div className="leading-tight">
              <span className="block font-display text-lg font-bold uppercase tracking-wide text-white">
                Contoso
              </span>
              <span className="block text-[11px] font-medium uppercase tracking-[0.28em] text-brand-clarity">
                Services Analytics
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user?.email && (
              <span
                className="hidden text-sm text-white/60 sm:inline"
                title={user.email}
              >
                {user.email}
              </span>
            )}
            <button
              onClick={() => void signOut()}
              className="contoso-btn border border-white/30 px-4 py-1.5 text-xs text-white hover:border-white hover:bg-white/10"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="h-0.5 bg-brand-blue" />
      </header>

      <main>
        {/* Hero */}
        <section className="contoso-hero relative overflow-hidden">
          <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 sm:pt-24">
            <p className="font-display text-xs font-bold uppercase tracking-[0.28em] text-brand-clarity">
              People &amp; Revenue
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              The practice, by the numbers
            </h1>
            <p className="mt-6 max-w-xl font-sans text-base leading-relaxed text-white/75 sm:text-lg">
              FTE headcount, utilization, and revenue across every Contoso
              service line — visualized the moment the data lands.
            </p>
          </div>
          <div className="h-1 w-full bg-brand-blue" />
        </section>

        {error && (
          <div className="mx-auto max-w-6xl px-6">
            <div className="mt-8 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          </div>
        )}

        {/* KPI band */}
        <section className="mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-6 py-16 sm:grid-cols-4 sm:divide-x sm:divide-gray-200">
          <BigStat label="Total FTEs" value={kpis.totalFte.toLocaleString()} />
          <BigStat
            label="Revenue (TTM)"
            value={compactUsd.format(kpis.totalRevenue)}
          />
          <BigStat
            label="Revenue / FTE"
            value={compactUsd.format(kpis.revenuePerFte)}
          />
          <BigStat
            label="Avg Utilization"
            value={`${kpis.avgUtilization}%`}
          />
        </section>

        {/* Analytics band */}
        {!loading && metrics.length > 0 && (
          <section className="bg-brand-deep py-16">
            <div className="mx-auto max-w-6xl px-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-clarity">
                Analytics
              </p>
              <h2 className="mt-3 text-3xl font-normal tracking-tight text-white sm:text-4xl">
                Trends &amp; mix
              </h2>
              <p className="mt-3 max-w-xl text-sm text-white/70">
                Revenue trajectory and the current-month mix of revenue and
                people across service lines.
              </p>

              <div className="mt-8 space-y-8">
                <RevenueTrendChart data={trend} />
                <div className="grid gap-8 lg:grid-cols-2">
                  <HorizontalBarChart
                    data={revenueByPractice}
                    color="#0085ca"
                    format={(n) => compactUsd.format(n)}
                    title="Revenue by practice (latest month)"
                    ariaLabel="Revenue by practice for the latest month"
                  />
                  <HorizontalBarChart
                    data={fteByPractice}
                    color="#00244a"
                    format={(n) => n.toLocaleString()}
                    title="FTEs by practice (latest month)"
                    ariaLabel="FTE headcount by practice for the latest month"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Records table */}
        <section className="mx-auto max-w-6xl px-6 pb-24 pt-16">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">
              Records
            </p>
            <h2 className="mt-2 text-3xl font-normal tracking-tight text-brand-deep sm:text-4xl">
              Service lines
            </h2>
          </div>

          {loading ? (
            <p className="py-16 text-center text-sm text-gray-400">Loading…</p>
          ) : (
            <div className={`overflow-hidden ${card}`}>
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-left text-xs uppercase tracking-wider text-gray-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Practice</th>
                    <th className="px-4 py-3 font-medium">Leader</th>
                    <th className="px-4 py-3 font-medium">Region</th>
                    <th className="px-4 py-3 text-right font-medium">FTE</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Revenue (mo)
                    </th>
                    <th className="px-4 py-3 text-right font-medium">Util.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rollups.map((r) => (
                    <tr key={r.code} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {r.name}
                        <span className="ml-2 text-gray-400">{r.code}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{r.leader}</td>
                      <td className="px-4 py-3 text-gray-600">{r.region}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                        {r.fte.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-900">
                        {usd.format(r.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                        {r.utilization}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function ContosoMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center bg-white">
      <span className="font-display text-sm font-bold leading-none tracking-tight text-brand-deep">
        C
      </span>
    </div>
  );
}

function BigStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 text-center sm:px-6">
      <p className="font-display text-4xl font-bold tabular-nums tracking-tight text-brand-blue sm:text-5xl">
        {value}
      </p>
      <p className="mt-3 font-display text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">
        {label}
      </p>
    </div>
  );
}
