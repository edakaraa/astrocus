# Astrocus Setup

## Mobil uygulama

```bash
npm install
npm start
```

## Postgres (yerel)

API artık **PostgreSQL + Prisma** kullanır. En hızlı yol:

```bash
docker compose up -d
```

`server/.env.example` dosyasını `server/.env` olarak kopyalayın (veya aynı `DATABASE_URL` değerini kullanın):

```text
DATABASE_URL="postgresql://astrocus:astrocus@localhost:5432/astrocus?schema=public"
```

## API

```bash
cd server
npm install
```

Şema oluşturma (ilk kurulum veya model değişince):

```bash
cd server
npm run db:push
```

İsteğe bağlı demo kullanıcı (`demo@astrocus.dev` / `demo1234`):

```bash
cd server
npm run db:seed
```

Sunucuyu çalıştırma:

```bash
cd server
npm run dev
```

Kök dizinden mobil + API birlikte:

```bash
npm run dev
```

API varsayılan olarak `http://localhost:4000` üzerinden çalışır. Mobil tarafta `EXPO_PUBLIC_API_URL` ile override edilebilir (`app.config.ts`).

## Typecheck

```bash
npm run typecheck
npm --prefix server run typecheck
```

## Notlar

- Offline seanslar cihazda saklanır ve sonra `/sessions/sync` ile senkronize edilir.
- Social auth butonları MVP demo akışı için provider tabanlı kullanıcı oluşturur.
- Prisma istemcisi `server` içinde `postinstall` ile `prisma generate` çalıştırır; CI’da da `npm run db:generate --prefix server` kullanılır.
