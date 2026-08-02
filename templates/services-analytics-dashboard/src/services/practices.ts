import { getRayfinClient, isLocalBackend } from './rayfinClient';
import { PRACTICES } from '@/data/sampleData';

// Shape mirrors the `Practices` entity in rayfin/data/Practices.ts.
export interface Practice {
  id: string;
  code: string;
  name: string;
  leader: string;
  region: string;
}

// Local-dev fallback: with no Fabric backend configured, keep records in
// memory so the dashboard is fully usable without a database (same
// convention as the Rayfin todo-app template). Seeded lazily from the
// bundled sample data so the first paint is never empty.
let inMemory: Practice[] | null = null;

function seedInMemory(): Practice[] {
  if (inMemory) return inMemory;
  inMemory = PRACTICES.map((p) => ({
    id: `local-${p.code}`,
    code: p.code,
    name: p.name,
    leader: p.leader,
    region: p.region,
  }));
  return inMemory;
}

export async function getPractices(): Promise<Practice[]> {
  if (isLocalBackend()) {
    return [...seedInMemory()].sort((a, b) => a.name.localeCompare(b.name));
  }

  const client = getRayfinClient();
  const rows = await client.data.Practices.select([
    'id',
    'code',
    'name',
    'leader',
    'region',
  ])
    .orderBy({ name: 'asc' })
    .execute();
  return rows as unknown as Practice[];
}

/**
 * Create every sample practice on a real backend. Returns a map of
 * `code -> id` so metric rows can be linked to their practice.
 * Used only by the one-time database seeder.
 */
export async function createSamplePractices(): Promise<Map<string, string>> {
  const client = getRayfinClient();
  const byCode = new Map<string, string>();
  for (const p of PRACTICES) {
    const created = (await client.data.Practices.create({
      code: p.code,
      name: p.name,
      leader: p.leader,
      region: p.region,
    })) as unknown as Practice;
    byCode.set(p.code, created.id);
  }
  return byCode;
}
