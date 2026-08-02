import { getPractices, createSamplePractices } from './practices';
import { getMetrics, createSampleMetrics } from './metrics';
import { isLocalBackend } from './rayfinClient';

/**
 * Ensure the app has data to show.
 *
 * - **Local backend:** no-op. The `practices`/`metrics` services keep an
 *   in-memory store that seeds itself lazily from the bundled sample data.
 * - **Real backend:** if no practices exist yet, create the full sample
 *   dataset (practices first, then linked monthly metrics). Idempotent — a
 *   backend that already has practices is left untouched.
 */
export async function ensureSeeded(): Promise<void> {
  if (isLocalBackend()) return;

  const existing = await getPractices();
  if (existing.length > 0) return;

  const idByCode = await createSamplePractices();
  await createSampleMetrics(idByCode);
}

export { getPractices, getMetrics };
