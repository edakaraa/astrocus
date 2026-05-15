# Astrocus Backend

- **Supabase:** PostgreSQL şeması, RLS, `complete_focus_session` RPC
- **Node API:** Gemini (Galaktik Tavsiyeler), hesap silme (service role)

## Kurulum

```bash
cp .env.example .env
npm install
```

Supabase migration:

```bash
npx supabase link --project-ref YOUR_REF
npx supabase db push
```

API:

```bash
npm run dev
```

## Endpoint'ler

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | Hayır |
| POST | `/ai/galactic-advice` | Bearer |
| POST | `/account/delete` | Bearer |
