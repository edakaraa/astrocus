# Astrocus API Contract (Current)

Base URL: `http://localhost:4000` (dev). Mobile tarafında `EXPO_PUBLIC_API_URL` ile override edilebilir.

Hata yanıtları (ör. validation): JSON `{ "error": { "message": "..." } }`. Başarılı auth ve çoğu endpoint, mobilin beklediği gibi **doğrudan** `AuthPayload` veya ilgili gövdeyi döner (sarmalayıcı `data` yok).

## Auth

### POST `/auth/register`

Body:

- `email`: string (email)
- `password`: string (min 6)
- `username`: string (min 2)
- `galaxyName`: string (min 2)

Response: `AuthPayload`

Errors:

- `400`: validation
- `409`: user already exists

### POST `/auth/login`

Body:

- `email`: string (email)
- `password`: string (min 6)

Response: `AuthPayload`

Errors:

- `400`: validation
- `404`: user not found
- `401`: invalid credentials

### POST `/auth/provider`

Body:

- `provider`: `"google" | "apple"`

Response: `AuthPayload`

## System

### GET `/health`

Response:

- `status`: `"ok"`
- `categories`: Category[]
- `stars`: Star[]

### GET `/bootstrap`

Auth: `Authorization: Bearer <token>`

Response: `AuthPayload`

Errors:

- `401`: unauthorized

## Profile

### PATCH `/profile`

Auth: `Authorization: Bearer <token>`

Body (partial):

- `username?`: string (min 2)
- `avatar?`: string
- `galaxyName?`: string (min 2)
- `language?`: `"tr" | "en"`
- `targetStarId?`: string
- `onboardingCompleted?`: boolean
- `dailyGoalMinutes?`: number (15..480)

Response: `AuthPayload`

Errors:

- `401`: unauthorized
- `400`: validation

## Sessions

### POST `/sessions/complete`

Auth: `Authorization: Bearer <token>`

Body:

- `categoryId`: string
- `durationMinutes`: number (5..120) (server tarafında `startedAt`/`completedAt` üzerinden doğrulanır)
- `startedAt`: string (ISO)
- `completedAt`: string (ISO)
- `pauseCount`: number (0..1)

Response:

- `payload`: `AuthPayload`
- `stardustEarned`: number
- `unlockedStarId`: string | null

Errors:

- `401`: unauthorized
- `400`: validation

### POST `/sessions/sync`

Auth: `Authorization: Bearer <token>`

Body:

- `sessions`: Array<{ id, categoryId, durationMinutes, startedAt, completedAt }>

Response: `AuthPayload`

Errors:

- `401`: unauthorized
- `400`: validation

## Types

### `AuthPayload`

- `token`: string
- `user`: User
- `sessions`: Session[]
- `unlockedStarIds`: string[]

Not: User/Session shape’leri şu an server tarafında `server/src/db.ts` type’larına paralel.

