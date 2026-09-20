# Tools & Generators Export

This folder contains everything needed to run TitanTech's 5 tools/generators in another site. The original source is **Next.js 15 + React 19 + Tailwind 3 + TanStack Query 5 + NextAuth 4 + Prisma**.

Target stack: **Astro** (with `@astrojs/react`).

## What's included

```
src/
  app/
    tools/
      mod-manager/page.tsx           Mod Manager UI
      game-ini/page.tsx              Game.ini generator (200+ settings)
      curve-overrides/page.tsx       Curve Overrides generator
      commands-ini/page.tsx          Commands.ini / role permissions
      rules-motd/page.tsx            Rules & MOTD generator
    api/
      gsh/mods/route.ts              Proxies pot-api.gsh-servers.com mods
      gsh/servers/route.ts           Proxies servers endpoint
      gsh/curve-overrides/...        Proxies curve overrides endpoint
      mods/refresh/route.ts          Clears mods cache
      profiles/[type]/route.ts       User profiles CRUD (list/create)
      profiles/[type]/[id]/route.ts  User profiles CRUD (get/update/delete)
      webhooks/generator/route.ts    Discord webhook for download notifications
  components/
    generators/ProfileManager.tsx    Save/load profiles UI (auth-gated)
    ui/Spinner.tsx                   Spinner
    ui/Modal.tsx                     Modal dialog
  data/
    game-ini-config.ts               200+ Game.ini setting definitions
    permissions-list.ts              Commands.ini permission list
  hooks/
    useProfiles.ts                   TanStack Query wrapper for profiles API
  lib/
    gsh-api.ts                       GSH API client (cached fetch + mappings)
tailwind.config.ts                   Theme tokens
globals.css                          Custom components (card, btn-primary, etc.)
```

## External dependencies

The tool pages use these npm packages:

```bash
npm install react react-dom lucide-react @tanstack/react-query
```

The API routes additionally need:

```bash
npm install next-auth @prisma/client  # for auth + profile DB
```

Profiles work via `next-auth` Discord OAuth + Prisma. If you don't need profiles, you can delete `ProfileManager`, `useProfiles`, and all the `/api/profiles/*` routes, then remove the `<ProfileManager>` component from each tool page.

## Porting to Astro

The tool pages are React client components. They will run inside Astro via `@astrojs/react` with `client:load`.

### 1. Install Astro + React integration

```bash
npm create astro@latest
npm install @astrojs/react react react-dom
npx astro add react tailwind
```

### 2. Drop in the files

Copy `src/components/`, `src/data/`, `src/hooks/`, `src/lib/` directly into your Astro `src/`.

Move the tool pages to Astro page wrappers — for each tool, create an `.astro` file:

```astro
---
// src/pages/tools/mod-manager.astro
import ModManagerPage from '../../components/tools/ModManager';
import Layout from '../../layouts/Layout.astro';
---
<Layout title="Mod Manager">
  <ModManagerPage client:load />
</Layout>
```

Then move `src/app/tools/mod-manager/page.tsx` → `src/components/tools/ModManager.tsx` and rename the export from `default function ModManagerPage()` to `export function ModManager()`.

### 3. Remove `'use client'` directives

Astro doesn't use them. Delete the `'use client';` line at the top of each tool page and any client component.

### 4. Replace Next.js-only imports

| Next.js import | Astro replacement |
|---|---|
| `import Image from 'next/image'` | Use plain `<img>` tag |
| `import Link from 'next/link'` | Use plain `<a>` tag |
| `import { useRouter } from 'next/navigation'` | Use `window.location` |
| `'use client'` | Remove |
| `@/...` path alias | Configure in `tsconfig.json` or change to relative paths |

The Mod Manager (`page.tsx`) uses `next/image` — replace with `<img>`.

### 5. Port the API routes

Astro has its own API endpoint format. Each Next.js `route.ts` becomes a `.ts` file under `src/pages/api/...`:

**Next.js (current)**:
```ts
// src/app/api/gsh/mods/route.ts
export async function GET() {
  const mods = await fetchMods();
  return NextResponse.json({ mods });
}
```

**Astro equivalent**:
```ts
// src/pages/api/gsh/mods.ts
import type { APIRoute } from 'astro';
import { fetchMods } from '../../../lib/gsh-api';

export const GET: APIRoute = async () => {
  const mods = await fetchMods();
  return new Response(JSON.stringify({ mods }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
```

Note: Astro endpoints need `export const prerender = false` if you're using static output mode. For full SSR set `output: 'server'` in `astro.config.mjs`.

### 6. Replace NextAuth (if keeping profiles)

`useProfiles.ts` and `ProfileManager.tsx` use `useSession()` from `next-auth/react`. Astro doesn't have a direct equivalent — popular options:

- **Auth.js** (the framework-agnostic successor of NextAuth) — has Astro adapter
- **Lucia** — popular Astro auth library
- Build your own session check

Replace `useSession()` with whatever auth hook your Astro auth library provides.

### 7. Port Prisma (or replace)

`/api/profiles/*` routes use Prisma to read/write a `Profile` table. If your target site already has a database/ORM, port the queries. Schema:

```prisma
model Profile {
  id            String   @id @default(cuid())
  userId        String
  generatorType String
  name          String
  data          Json
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  @@index([userId, generatorType])
}
```

### 8. Tailwind setup

The tools depend on custom theme tokens and component classes. Copy:
- `tailwind.config.ts` → merge `theme.extend` into your Astro Tailwind config
- `globals.css` → import this in your Astro layout (it has all the `card`, `btn-primary`, `input-field` etc. component classes the tools rely on)

### 9. Environment variables

Required for the GSH API proxy routes:

```bash
GSH_API_HOST=pot-api.gsh-servers.com
GSH_API_TOKEN=your_token_here
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...  # optional, for download tracking
```

## What each tool needs

| Tool | API routes needed | Profiles? |
|---|---|---|
| Mod Manager | `/api/gsh/mods`, `/api/mods/refresh` | optional |
| Game.ini | none (fully client-side) | optional |
| Curve Overrides | `/api/gsh/curve-overrides/...` | optional |
| Commands.ini | none (fully client-side) | optional |
| Rules/MOTD | none (fully client-side) | optional |

The webhook route (`/api/webhooks/generator`) is optional — it pings Discord when someone downloads a config. Tools work fine without it; the `fetch()` calls catch errors silently.

## Minimum viable port (no auth, no profiles)

If you just want the generators working in Astro without profiles:

1. Delete `src/components/generators/`, `src/hooks/useProfiles.ts`, `src/app/api/profiles/`
2. In each tool page, delete the `<ProfileManager .../>` JSX block and the `import { ProfileManager }` line
3. Port the GSH API routes as described in step 5
4. Done — fully client-side tools with no auth

## Original commit

This export was made from branch `nextjs-rebuild` at commit `7191bc9`.
