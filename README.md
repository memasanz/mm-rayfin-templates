# MM Rayfin Templates

A curated gallery of [Project Rayfin](https://github.com/microsoft/awesome-rayfin) templates for
building and shipping Fabric-hosted apps fast. Point the Rayfin CLI at this repo to scaffold any
template in the gallery:

```bash
npm create @microsoft/rayfin -- --template https://github.com/memasanz/mm-rayfin-templates
```

The CLI reads [`rayfin-template.yml`](./rayfin-template.yml) at the repo root and shows an
interactive picker when multiple templates are available.

> **Hitting `401 Unauthorized` on `@microsoft/create-rayfin`?** Your machine's user-level `.npmrc`
> maps the `@microsoft` scope to GitHub Packages. Rayfin lives on the public Microsoft feed —
> override the scope for the command (run it **all on one line**):
> ```powershell
> npm create @microsoft/rayfin --@microsoft:registry=https://packagefeedproxy.microsoft.io/npm/ -- --template https://github.com/memasanz/mm-rayfin-templates
> ```
> or set it permanently: `npm config set @microsoft:registry https://packagefeedproxy.microsoft.io/npm/`.
>
> **Do not split the command with a trailing `\`.** In PowerShell `\` is a literal character, not a
> line-continuation (that's `` ` ``). A stray trailing `\` is passed to the scaffolder as the target
> directory and resolves to `C:\`, producing `Failed to clear target directory 'C:\': EPERM`.

## Templates

| Template | Description | Auth | Data | Stack |
| --- | --- | --- | --- | --- |
| **[Contoso Services Analytics Dashboard](./templates/services-analytics-dashboard)** | Fabric-authenticated analytics dashboard for a professional-services firm — FTE & revenue KPIs, D3 charts, and a reusable "Contoso" design system, driven by seeded sample data. | ✅ | ✅ | React 19, Vite, Tailwind, D3 |
| **[Contoso Services Request Tracker](./templates/services-crud-tracker)** | Fabric-authenticated **CRUD** app on a Rayfin MSSQL backend — create, edit, and delete service requests with live KPIs and full **write-back**, styled like the analytics dashboard. Bundles a **spreadsheet-to-datamodel** skill (CSV/XLSX/XLSM → Rayfin entities). | ✅ | ✅ | React 19, Vite, Tailwind, D3 |

## What is Project Rayfin?

Rayfin is a **Backend-as-a-Service (BaaS)** platform: define your data model with TypeScript
decorators and Rayfin handles the backend — auth, data API, storage, and hosting.

Every template in this gallery bundles the **published `rayfin` AI skill**
(`.agents/skills/rayfin/SKILL.md`) and the Rayfin MCP server (`.mcp.json`) so AI coding agents have
version-locked Rayfin context out of the box.

The **Contoso Services Request Tracker** additionally bundles a **`spreadsheet-to-datamodel`** skill
(`.agents/skills/spreadsheet-to-datamodel/`): point an agent at a CSV/XLSX/XLSM and it profiles the
sheets (Python) and helps you author Rayfin entities in the template's shape.

## Authoring a template

A Rayfin gallery template is just a folder of files that the `@microsoft/create-rayfin` scaffolder
clones and copies. There is no build step or plugin system — the "template engine" is the file
layout plus two small manifests. Here is the whole process, and exactly which files make it work.

### 1. The two-level layout

```
mm-rayfin-templates/            ← gallery repo (what you point the CLI at)
├── rayfin-template.yml         ← ROOT manifest: lists every template + its path
├── README.md / LICENSE / .gitignore
└── templates/
    └── <kebab-name>/           ← one self-contained template (a full app)
        ├── rayfin-template.yml ← LEAF manifest: this one template
        ├── package.json        ← template metadata + app deps/scripts
        ├── manifest.json       ← gallery capabilities (services, tokens)
        ├── rayfin/             ← Rayfin backend (services + data model)
        ├── src/               ← the app (React/Vite here)
        └── … config + docs
```

The CLI reads the **root `rayfin-template.yml`**, shows a picker of its `entries`, then scaffolds the
chosen `path`. With a single entry it scaffolds that one automatically.

### 2. Step-by-step

1. **Scaffold the folders.** Create `templates/<kebab-name>/` (kebab-case; the name must match
   `package.json` → `template.name`, `manifest.json` → `templateId`, and `rayfin/rayfin.yml` →
   `id`/`name`).
2. **Register it in the root `rayfin-template.yml`** — add an `entries` item with `path` and `name`.
   Add a row to the table in this README too.
3. **Write the two manifests** — `package.json` (with the `template` object) and `manifest.json`
   (capability booleans + tokens). Add a **leaf `rayfin-template.yml`** with `path: .`.
4. **Configure the backend** — `rayfin/rayfin.yml` turns on auth / data / static hosting. Enable
   only what the app needs (`storage`/`functions` off here).
5. **Define the data model** — decorator entity classes in `rayfin/data/*.ts`, aggregated by
   `rayfin/data/schema.ts` into the `schema` array and `AppSchema` type. Omit or leave empty for a
   data-less template.
6. **Build the app** — `index.html` + `src/` (entry, auth wiring, the typed `RayfinClient`, pages,
   styles). Wire config with `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`,
   `eslint.config.js`.
7. **Add an `.npmrc`** pinning `@microsoft` to the public Microsoft feed so `npm install` resolves
   Rayfin packages.
8. **(Recommended) Bundle the AI-agent files** — copy the published `rayfin` skill
   (`.agents/skills/rayfin/SKILL.md`) verbatim, plus `.mcp.json` and `AGENTS.md`.
9. **Verify** — `npm install && npm run build && npm run test && npm run lint` inside the template.
10. **Publish** — push to GitHub; consume with
    `npm create @microsoft/rayfin -- --template <repo-url>`.

### 3. Which files do what

Every file below was **created** to build the `services-analytics-dashboard` template (this repo
started empty, so nothing pre-existing was altered). Grouped by the role it plays:

| Role | Files |
| --- | --- |
| **Gallery manifests** | root `rayfin-template.yml`, `templates/…/rayfin-template.yml` (leaf), `templates/…/manifest.json` |
| **Template + app metadata** | `templates/…/package.json` (the `template` object, deps, scripts) |
| **Rayfin backend** | `rayfin/rayfin.yml` (services), `rayfin/tsconfig.json` |
| **Data model** | `rayfin/data/Practices.ts`, `rayfin/data/PeriodMetrics.ts`, `rayfin/data/schema.ts` |
| **App entry & routing** | `index.html`, `src/main.tsx`, `src/App.tsx` |
| **Auth & data access** | `src/services/{rayfinClient,bootstrap,IAuthService,MockAuthService,RayfinAuthService,practices,metrics,analytics,seed}.ts`, `src/hooks/AuthContext.tsx` |
| **UI & design system** | `src/pages/DashboardPage.tsx`, `src/components/*.tsx`, `src/styles/main.css` |
| **Sample data** | `src/data/sampleData.ts`, `data/sample-fte-revenue.csv` |
| **Build/lint/test config** | `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `eslint.config.js`, `.npmrc`, `.gitignore` |
| **AI-agent context** | `.agents/skills/rayfin/SKILL.md` (published, verbatim), `.mcp.json`, `AGENTS.md` |
| **Docs** | `templates/…/README.md`, this root `README.md` |

The per-file **rationale** (why each is required) lives in the
[template README's "Required files" table](./templates/services-analytics-dashboard/README.md#required-files).

> **Minimum viable template.** The gallery only strictly needs: the root + leaf `rayfin-template.yml`,
> `package.json` (with `template`), `manifest.json`, `rayfin/rayfin.yml`, and an app entry
> (`index.html` + `src/main.tsx`). Everything else — data model, extra config, AI-agent files — is
> added as the template needs it.

## License

[MIT](./LICENSE)
