/**
 * Presentation-ready sample data for the Contoso Services Analytics dashboard.
 *
 * This is a self-contained, deterministic dataset — no spreadsheet upload is
 * required for v1. The same shape is what a future upload path would produce,
 * so the dashboard, seeding, and (later) upload can all share these types.
 *
 * The numbers are internally coherent: revenue is derived from billable hours
 * and a per-practice blended rate, billable hours from FTE and utilization.
 * A light, seeded seasonality gives the charts a realistic, story-worthy shape
 * (summer utilization dip, year-end push, one fast-growing practice).
 */

export interface PracticeSeed {
  code: string;
  name: string;
  leader: string;
  region: string;
  /** Starting full-time-equivalent headcount at the first month. */
  startFte: number;
  /** Net FTE added per month (may be fractional; rounded per row). */
  fteGrowthPerMonth: number;
  /** Blended billed rate per hour, in USD. */
  ratePerHour: number;
  /** Baseline utilization percentage before seasonality/noise. */
  utilizationBase: number;
}

export interface MetricRow {
  practiceCode: string;
  /** First day of the reporting month, ISO date (YYYY-MM-DD). */
  period: string;
  fte: number;
  revenue: number;
  billableHours: number;
  utilization: number;
}

/** Five professional-services lines, Contoso-branded. */
export const PRACTICES: PracticeSeed[] = [
  {
    code: 'RTS',
    name: 'Restructuring & Turnaround',
    leader: 'Dana Whitfield',
    region: 'Americas',
    startFte: 84,
    fteGrowthPerMonth: 1.4,
    ratePerHour: 465,
    utilizationBase: 82,
  },
  {
    code: 'CPI',
    name: 'Corporate Performance Improvement',
    leader: 'Marcus Lindqvist',
    region: 'EMEA',
    startFte: 120,
    fteGrowthPerMonth: 2.2,
    ratePerHour: 410,
    utilizationBase: 78,
  },
  {
    code: 'DAI',
    name: 'Disputes & Investigations',
    leader: 'Priya Nair',
    region: 'Americas',
    startFte: 66,
    fteGrowthPerMonth: 0.6,
    ratePerHour: 520,
    utilizationBase: 74,
  },
  {
    code: 'PES',
    name: 'Private Equity Services',
    leader: 'Sofia Ricci',
    region: 'EMEA',
    startFte: 38,
    fteGrowthPerMonth: 3.1,
    ratePerHour: 495,
    utilizationBase: 80,
  },
  {
    code: 'TAX',
    name: 'Tax Advisory',
    leader: 'Kenji Watanabe',
    region: 'APAC',
    startFte: 52,
    fteGrowthPerMonth: 0.9,
    ratePerHour: 355,
    utilizationBase: 76,
  },
];

const MONTHS = 18;
const FIRST_YEAR = 2024;
const FIRST_MONTH = 0; // January
const HOURS_PER_MONTH = 160;

/** Deterministic, seeded pseudo-noise in [-1, 1] from a string + index. */
function noise(code: string, i: number): number {
  let h = 2166136261;
  const key = `${code}:${i}`;
  for (let c = 0; c < key.length; c++) {
    h ^= key.charCodeAt(c);
    h = Math.imul(h, 16777619);
  }
  // Map the 32-bit hash to [-1, 1].
  return ((h >>> 0) / 0xffffffff) * 2 - 1;
}

/** Seasonal utilization delta: summer dip (Jun–Aug), year-end push (Nov–Dec). */
function seasonalUtil(monthOfYear: number): number {
  if (monthOfYear >= 5 && monthOfYear <= 7) return -6; // Jun–Aug
  if (monthOfYear === 10 || monthOfYear === 11) return 4; // Nov–Dec
  if (monthOfYear === 0) return -2; // slow January start
  return 0;
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function isoMonth(index: number): string {
  const total = FIRST_MONTH + index;
  const year = FIRST_YEAR + Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}-01`;
}

/**
 * Build the full set of monthly metric rows (practices × months).
 * Pure and deterministic — identical output on every call.
 */
export function generateMetrics(): MetricRow[] {
  const rows: MetricRow[] = [];

  for (const p of PRACTICES) {
    for (let i = 0; i < MONTHS; i++) {
      const monthOfYear = (FIRST_MONTH + i) % 12;

      const fte = Math.round(p.startFte + p.fteGrowthPerMonth * i);

      const utilization = Math.round(
        clamp(
          p.utilizationBase + seasonalUtil(monthOfYear) + noise(p.code, i) * 3,
          58,
          94
        )
      );

      const billableHours = Math.round(
        fte * HOURS_PER_MONTH * (utilization / 100)
      );

      const revenue = Math.round(billableHours * p.ratePerHour);

      rows.push({
        practiceCode: p.code,
        period: isoMonth(i),
        fte,
        revenue,
        billableHours,
        utilization,
      });
    }
  }

  return rows;
}
