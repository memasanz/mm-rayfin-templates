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
> override the scope for the command:
> ```bash
> npm create @microsoft/rayfin --@microsoft:registry=https://packagefeedproxy.microsoft.io/npm/ -- \
>   --template https://github.com/memasanz/mm-rayfin-templates
> ```
> or set it permanently: `npm config set @microsoft:registry https://packagefeedproxy.microsoft.io/npm/`.

## Templates

| Template | Description | Auth | Data | Stack |
| --- | --- | --- | --- | --- |
| **[Contoso Services Analytics Dashboard](./templates/services-analytics-dashboard)** | Fabric-authenticated analytics dashboard for a professional-services firm — FTE & revenue KPIs, D3 charts, and a reusable "Contoso" design system, driven by seeded sample data. | ✅ | ✅ | React 19, Vite, Tailwind, D3 |

## What is Project Rayfin?

Rayfin is a **Backend-as-a-Service (BaaS)** platform: define your data model with TypeScript
decorators and Rayfin handles the backend — auth, data API, storage, and hosting.

Every template in this gallery bundles the **published `rayfin` AI skill**
(`.agents/skills/rayfin/SKILL.md`) and the Rayfin MCP server (`.mcp.json`) so AI coding agents have
version-locked Rayfin context out of the box.

## License

[MIT](./LICENSE)
