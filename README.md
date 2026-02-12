# 🔐 Secure Transaction Service — TurboRepo Monorepo

A production-ready mini transaction service with encrypted payload storage using modern monorepo architecture.

## 🎯 Features

- **Fastify API** — High-performance backend on port 4000
- **Next.js Frontend** — Modern App Router UI on port 3000
- **AES-256-GCM Encryption** — Secure payload encryption with key derivation
- **TypeScript Everywhere** — Strict typing across all packages
- **TurboRepo** — Optimized build & dev pipeline
- **pnpm Workspaces** — Efficient dependency management
- **In-Memory Storage** — Quick iteration (replace with DB for production)
- **Vercel-Ready** — Deploy web and api separately

## 📦 Monorepo Structure

```
secure-tx-monorepo/
├── apps/
│   ├── api/              # Fastify backend (port 4000)
│   └── web/              # Next.js frontend (port 3000)
├── packages/
│   └── crypto/           # Shared AES-256-GCM encryption
├── turbo.json            # TurboRepo config
├── pnpm-workspace.yaml   # Workspace definition
├── tsconfig.json         # Root TypeScript config
└── package.json          # Root scripts
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **pnpm** 9+

### Installation

```bash
cd secure-tx-monorepo

# Install dependencies
pnpm install
```

### Development

```bash
# Start both frontend (3000) and API (4000) in parallel
pnpm dev

# Or run individually
pnpm dev --filter=@repo/web
pnpm dev --filter=@repo/api
```

### Build

```bash
# Build all apps
pnpm build
```

## 🌐 Frontend (web)

**Location:** `apps/web`  
**Technology:** Next.js 15, React 19, TypeScript  
**Port:** 3000

### Features

- Party ID input
- JSON payload textarea
- Encrypt & Save button → calls `POST /tx/encrypt`
- Fetch button → calls `GET /tx/:id`
- Decrypt button → calls `POST /tx/:id/decrypt`
- Real-time display of encrypted/decrypted outputs
- Error messages and validation

### Environment

Copy `.env.example` to `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## 🔗 Backend API (api)

**Location:** `apps/api`  
**Technology:** Fastify, TypeScript  
**Port:** 4000

### Routes

#### `POST /tx/encrypt`

Encrypt and store a transaction.

**Request:**

```json
{
  "partyId": "party_123",
  "payload": { "amount": 100, "currency": "AED" }
}
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "encrypted": "base64-encoded-ciphertext"
}
```

#### `GET /tx/:id`

Fetch a stored encrypted record (no decryption).

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "partyId": "party_123",
  "encrypted": "base64-encoded-ciphertext"
}
```

#### `POST /tx/:id/decrypt`

Decrypt a stored record (requires matching `partyId`).

**Request:**

```json
{
  "partyId": "party_123"
}
```

**Response:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "payload": { "amount": 100, "currency": "AED" }
}
```

### Environment

Copy `.env.example` to `.env`:

```bash
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

## 🔐 Encryption Package (crypto)

**Location:** `packages/crypto`  
**Technology:** Node.js crypto module, TypeScript

### API

#### `encrypt(data: Record<string, unknown>, partyId: string): string`

Encrypts a JSON-serialisable object using AES-256-GCM. The encryption key is derived from the `partyId` using SHA-256.

**Returns:** A base64-encoded string containing: `[IV (12B) | AuthTag (16B) | CipherText]`

#### `decrypt(encryptedData: string, partyId: string): Record<string, unknown>`

Decrypts a base64-encoded token back to the original object. Validates the partyId matches the encryption key.

**Returns:** The original JSON object.

**Throws:** If the `partyId` is wrong or the data has been tampered with.

### Implementation Details

- **Algorithm:** AES-256-GCM
- **Key Derivation:** SHA-256(partyId)
- **IV:** 12 random bytes per encryption
- **Auth Tag:** 128-bit authentication tag
- **Encoding:** Base64 (for transmission/storage)

## 🏗 TurboRepo Configuration

The `turbo.json` defines:

- **build** pipeline with dependency ordering
- **dev** pipeline with persistent caching disabled
- **lint** pipeline

All workspace packages are properly linked, so `@repo/crypto` is available to both apps.

## 📜 Root Scripts

```bash
pnpm dev          # Start dev servers (all apps)
pnpm build        # Build all apps
pnpm lint         # Type-check all apps
pnpm format       # Format code (Prettier)
```

## 🌍 Vercel Deployment

### Deploy Frontend

```bash
# Use web app from apps/web
vercel deploy apps/web
```

Set environment variable:

```bash
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Deploy API

```bash
# Use api app from apps/api
vercel deploy apps/api
```

Set environment variables:

```bash
PORT=3000 (or as assigned by Vercel)
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

## 📝 Example Workflow

1. **Open Frontend** → `http://localhost:3000`
2. **Enter Party ID** → `party_123`
3. **Enter Payload** → `{ "amount": 500, "currency": "USD" }`
4. **Click "🔒 Encrypt & Save"** → Get transaction ID and encrypted output
5. **Click "📥 Fetch"** → Verify encrypted record is stored
6. **Click "🔓 Decrypt"** → Reveal original payload (partyId must match)
7. **Try Wrong PartyId** → Decryption fails (403 Forbidden)

## 🧼 Code Quality

- **Strict TypeScript** — All `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- **No `any` types** — Full type safety
- **Error Handling** — Proper HTTP status codes and error messages
- **Comments** — Key functions documented
- **Clean Structure** — Modular, well-organized code
- **Prettier** — Consistent formatting across all files

## 📦 Dependencies

### Root

- `turbo` — Monorepo orchestration
- `typescript` — Language
- `prettier` — Code formatting

### API (`@repo/api`)

- `fastify` — Web framework
- `@fastify/cors` — CORS middleware
- `tsx` — TypeScript runner (dev)
- `@repo/crypto` — Shared encryption logic

### Web (`@repo/web`)

- `next` — React framework
- `react` / `react-dom` — UI

### Crypto (`@repo/crypto`)

- Built-in: `node:crypto`, `node:crypto`

## 🐛 Troubleshooting

### "Cannot find module '@repo/crypto'"

Ensure `pnpm install` completed successfully and `pnpm-workspace.yaml` is correct.

### API responding with CORS errors

Check `CORS_ORIGIN` env var in `apps/api/.env` — defaults to `true` (allow all).

### Decryption fails with wrong partyId

This is expected — the encryption key is derived from `partyId` so a mismatch causes decryption to fail.

### Port already in use

Change port via environment variables:

```bash
PORT=5000 pnpm dev --filter=@repo/api
```

## 🚀 Performance Considerations

- **In-Memory Storage** — Fast but data is lost on restart. Replace with PostgreSQL/MongoDB for production.
- **Encryption Overhead** — AES-256-GCM is fast; only 12-byte random IV per encryption.
- **TurboRepo Caching** — Leverages incremental builds to speed up CI/CD.

## 📄 License

MIT

---

**Built with ❤️ for secure, efficient transaction handling.**
