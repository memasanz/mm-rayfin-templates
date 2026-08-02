# Contoso Services Analytics Dashboard

A Fabric-authenticated analytics dashboard for a professional-services firm ("Contoso"), built on
[Project Rayfin](https://github.com/microsoft/awesome-rayfin). It shows FTE headcount, utilization,
and revenue across service lines with a reusable, corporate "Contoso" design system — driven by
**seeded sample data**, so it runs and demos with no data setup.

- **Auth** — Microsoft Fabric SSO in production, mock email/password locally.
- **Data** — `Practices` and `PeriodMetrics` entities via Rayfin's typed data client.
- **Design system** — deep-navy / accent-blue / amber tokens, square geometry, condensed display
  type. Reskin the whole app from one CSS file.
- **Charts** — D3 revenue trend line + horizontal bar charts for revenue and FTE mix.
- **AI-ready** — bundles the published `rayfin` AI skill and Rayfin MCP server.

> **Sample data only (v1).** All figures come from a deterministic, self-contained generator. There
> is no spreadsheet upload yet — that is the planned next iteration (see [Roadmap](#roadmap)).

## Getting started

```bash
# Install dependencies (uses the pinned @microsoft feed in .npmrc)
npm install

# Deploy/attach a Rayfin backend and start the Vite dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and sign in. Against a **local** backend you are
signed in with a mock dev account and the dashboard renders the in-memory sample data immediately.
Against a **Fabric** backend, the sample dataset is seeded into the database on first load if it is
empty.

To build the static bundle Fabric hosts:

```bash
npm run build        # tsc -b && vite build  → dist/
npm run preview      # preview the built bundle
```

## Required files

Every file below is required for this template to build, run, and be picked up by the Rayfin gallery
CLI. This table doubles as a checklist if you fork the template.

| File | Why it's needed |
| --- | --- |
| `package.json` | Template metadata (the `template` object — `name`, `displayName`, `description`) that the gallery reads, plus dependencies and the `dev`/`build`/`build:fabric`/`lint`/`test` scripts. `template.name` **must** match the directory name. |
| `manifest.json` | Gallery manifest: `templateId` (must equal `template.name`), `icon`, the `services` capability booleans (auth/data/storage/staticHosting), `hasDabSchema`, and replacement `tokens`. |
| `rayfin-template.yml` | Leaf template manifest the CLI reads when scaffolding this single template. Contains `apiVersion: v1`, `metadata`, and an `entries` item with `path: .`. |
| `rayfin/rayfin.yml` | Rayfin **service configuration** — enables auth (Fabric + password), the data API (`mssql` dialect), and static hosting (build command + output folder). `id`/`name` must match the directory name. |
| `rayfin/data/schema.ts` | The Rayfin **data model**. Aggregates the decorator-based entity classes into the `schema` array and the `AppSchema` type the typed client is generic over. |
| `rayfin/data/Practices.ts`, `rayfin/data/PeriodMetrics.ts` | The entity definitions (`@entity`, `@uuid`, `@text`, `@int`, `@decimal`, `@date`, `@one`). Split per entity, mirroring Rayfin conventions. |
| `rayfin/tsconfig.json` | Isolated TypeScript config for the `rayfin/` project (Node module resolution, emit for DAB), kept separate from the app TS config and wired via a project reference. |
| `index.html` | Vite HTML entry document that loads `src/main.tsx`. |
| `src/main.tsx` | React entry point — bootstraps auth, wraps the app in `AuthProvider`, imports the global stylesheet. |
| `tsconfig.json` | Root app TypeScript config (ES2022, `react-jsx`, `@/*` path alias, TC39 decorators lib), referencing `./rayfin`. |
| `vite.config.ts` | Vite build config — React SWC plugin, Tailwind plugin, `@` alias, ES2022 target. |
| `vitest.config.ts` | Test runner config (jsdom environment, `@` alias). |
| `eslint.config.js` | ESLint 9 flat config with the TypeScript + React Hooks rule set. |
| `.gitignore` | Ignores build artifacts, dependencies, and Rayfin-generated files (`rayfin/.temp`, `.env`, lockfiles). |
| `.npmrc` | Pins the `@microsoft` scope to the public Microsoft package feed. Required because some machines map `@microsoft` to GitHub Packages (which 401s for Rayfin), and npm does not read the gallery-root `.npmrc`. |

### Bundled AI-agent files (recommended, not gallery-mandated)

| File | Why it's included |
| --- | --- |
| `.agents/skills/rayfin/SKILL.md` | The **published, version-locked `rayfin` skill** (`author: microsoft`, `rayfin-managed: true`). Gives AI coding agents authoritative Rayfin context — decorators, auth, deployment, CLI, and how to reach the version-locked docs. Shipped **verbatim**; do not edit or hand-author your own. |
| `.mcp.json` | Declares the `rayfin` MCP server (`@microsoft/rayfin-mcp`) so agents can call `search_docs`, `get_doc`, and `discover_packages` for docs matched to the installed packages. |
| `AGENTS.md` | Tells agents to load the skill and MCP server before writing Rayfin code, and how to fall back to `rayfin docs ...`. |

## Project structure

```
services-analytics-dashboard/
├── .agents/skills/rayfin/SKILL.md   # published Rayfin AI skill (verbatim)
├── .mcp.json                        # Rayfin MCP server for AI agents
├── AGENTS.md                        # agent onboarding notes
├── manifest.json                    # gallery capabilities manifest
├── rayfin-template.yml              # leaf template manifest
├── data/
│   └── sample-fte-revenue.csv       # the seed data as a spreadsheet (for reference / future upload)
├── rayfin/
│   ├── rayfin.yml                   # service config (auth + data + hosting)
│   ├── tsconfig.json                # isolated Rayfin TS config
│   └── data/
│       ├── Practices.ts             # service-line entity
│       ├── PeriodMetrics.ts         # monthly FTE/revenue entity
│       └── schema.ts                # schema array + AppSchema type
├── src/
│   ├── main.tsx                     # bootstrap + AuthProvider
│   ├── App.tsx                      # routes + auth guard
│   ├── data/
│   │   └── sampleData.ts            # deterministic sample data generator
│   ├── services/
│   │   ├── rayfinClient.ts          # typed RayfinClient init
│   │   ├── bootstrap.ts             # env → client + auth-service wiring
│   │   ├── IAuthService.ts          # auth contract
│   │   ├── MockAuthService.ts       # local email/password auth
│   │   ├── RayfinAuthService.ts     # Fabric brokered auth
│   │   ├── practices.ts             # Practices reads + sample seed
│   │   ├── metrics.ts               # PeriodMetrics reads + sample seed
│   │   ├── analytics.ts             # pure KPI/trend/rollup helpers
│   │   └── seed.ts                  # ensureSeeded() orchestrator
│   ├── hooks/
│   │   └── AuthContext.tsx          # React auth context + useAuth()
│   ├── components/
│   │   ├── AuthPage.tsx             # sign-in screen
│   │   ├── RevenueTrendChart.tsx    # D3 revenue trend (area + line)
│   │   └── HorizontalBarChart.tsx   # D3 reusable horizontal bars
│   ├── pages/
│   │   └── DashboardPage.tsx        # header, hero, KPIs, charts, table
│   ├── styles/
│   │   └── main.css                 # Contoso design tokens + components
│   └── __tests__/
│       └── analytics.test.ts        # sample-data + aggregation tests
└── (config: package.json, tsconfig.json, vite/vitest/eslint configs, index.html, .gitignore, .npmrc)
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Runs `rayfin up` (excluding static hosting), then starts the Vite dev server. |
| `npm run build` | Type-checks (`tsc -b`) and builds the production bundle to `dist/`. |
| `npm run build:fabric` | Same build, invoked by Rayfin static hosting during deploy. |
| `npm run preview` | Serves the built `dist/` bundle locally. |
| `npm run lint` | Runs ESLint over the project. |
| `npm run test` | Runs the Vitest suite once. |
| `npm run rayfin:up` | Deploys/attaches the Rayfin backend. |

## Data model & sample data

Two entities model the domain (both use Rayfin's **default permissions** — any authenticated caller
can read/write; tighten later with `@authenticated`/`@role`):

- **`Practices`** — a service line: `code`, `name`, `leader`, `region`.
- **`PeriodMetrics`** — one row per practice per month: `period`, `fte`, `revenue`, `billableHours`,
  `utilization`, linked to a practice via `@one`.

`src/data/sampleData.ts` generates a deterministic 18-month history for five Contoso practices.
Revenue is derived from billable hours and a per-practice blended rate, with light seeded seasonality
(summer utilization dip, year-end push, one fast-growing practice) so the charts tell a story. The
same dataset is exported to `data/sample-fte-revenue.csv` for reference and as the shape a future
upload path would produce.

Seeding is handled by `ensureSeeded()`:

- **Local backend** — the `practices`/`metrics` services keep an in-memory store seeded lazily from
  the sample generator, so the first paint is never empty.
- **Fabric backend** — if no practices exist, the full dataset is created (practices, then linked
  metrics). Idempotent.

## Design system

All brand styling lives in `src/styles/main.css` as CSS custom properties and two component classes
(`contoso-hero`, `contoso-btn`). To reskin the dashboard, change the `--color-brand-*` tokens and the
`--font-display` / `--radius-btn` values — every KPI, chart accent, hero, and button follows.

## Deploying to Fabric

`rayfin up` provisions the backend (auth + data + static hosting) into your Fabric workspace. The
publishable key and API URL are injected as the `__RAYFIN_PK__` / `__RAYFIN_API_URL__` tokens at
scaffold time and surfaced to the app via `VITE_RAYFIN_*` env vars (see `src/services/bootstrap.ts`).
Fabric SSO additionally requires `VITE_FABRIC_WORKSPACE_ID`, `VITE_FABRIC_ITEM_ID`, and
`VITE_FABRIC_PORTAL_URL`. See the bundled `rayfin` skill and `rayfin docs` for the full deployment
workflow.

## Roadmap

- **Spreadsheet upload** — parse an uploaded `.xlsx`/`.csv` (matching `data/sample-fte-revenue.csv`)
  and persist rows to `PeriodMetrics`, replacing the seeded data. The schema and sample file are
  shaped to make this a drop-in addition.
- **Drill-down** — per-practice detail pages and date-range filtering.
