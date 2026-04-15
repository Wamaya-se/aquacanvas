# Aquacanvas

AI-driven e-handel: användare laddar upp ett foto, väljer konststil och beställer tryck. Byggd med Next.js, Supabase och Stripe.

## Dokumentation i repot

| Fil | Innehåll |
|-----|----------|
| **[TECHSTACK.md](./TECHSTACK.md)** | Stack, projektstruktur, **lokal setup, Git-push, Vercel & Supabase** |
| **[ROADMAP.md](./ROADMAP.md)** | Status, vad som är gjort, backlog |
| **[brand_assets/DESIGN.md](./brand_assets/DESIGN.md)** | Designsystem (färger, typografi, komponenter) |

## Snabbstart (lokal utveckling)

```bash
git clone https://github.com/Wamaya-se/aquacanvas.git
cd aquacanvas
npm install
cp .env.example .env.local
# Fyll i .env.local (Supabase-nycklar m.m.)
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000).

**Krav:** Node.js **20+** (LTS rekommenderas), npm.

## Deploy till production

Kort: **push till `main` på GitHub** → Vercel bygger och publicerar automatiskt.

Steg-för-steg, preview-branches och när Supabase krävs manuellt: se **[TECHSTACK.md — Deployment & drift](./TECHSTACK.md#deployment--drift)**.

**Production:** [aquacanvas.vercel.app](https://aquacanvas.vercel.app)
