# ⚡ Quick Reference

## Setup (First Time)

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

## Development Commands

```bash
# Start all in parallel
pnpm dev

# Start individual apps
pnpm dev --filter=@repo/web
pnpm dev --filter=@repo/api
pnpm dev --filter=@repo/crypto

# Build all
pnpm build

# Type-check all
pnpm lint

# Format code
pnpm format
```

## API Quick Test

```bash
# Health check
curl http://localhost:4000/health

# Encrypt
curl -X POST http://localhost:4000/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{"partyId":"test","payload":{"data":"value"}}'

# Get transaction (replace ID)
curl http://localhost:4000/tx/{id}

# Decrypt (replace ID)
curl -X POST http://localhost:4000/tx/{id}/decrypt \
  -H "Content-Type: application/json" \
  -d '{"partyId":"test"}'
```

## Browser URLs

| Service           | URL                    | Port |
|-------------------|------------------------|------|
| Frontend          | http://localhost:3000  | 3000 |
| API               | http://localhost:4000  | 4000 |
| API Health        | http://localhost:4000/health | 4000 |

## Ports & Environment

```bash
# Change API port
PORT=5000 pnpm dev --filter=@repo/api

# Use different API in frontend
NEXT_PUBLIC_API_URL=http://localhost:5000 pnpm dev --filter=@repo/web

# Production build
pnpm build
npm start # in each app
```

## Project Files

| File/Folder | Purpose |
|---|---|
| `turbo.json` | Build pipeline config |
| `pnpm-workspace.yaml` | Workspace definition |
| `tsconfig.json` | Root TypeScript config |
| `package.json` | Root scripts |
| `apps/api/src/` | Backend code |
| `apps/web/src/` | Frontend code |
| `packages/crypto/src/` | Encryption logic |
| `README.md` | Full docs |
| `SETUP.md` | Setup guide |
| `ARCHITECTURE.md` | Design overview |
| `USAGE.md` | Examples |

## Troubleshooting

| Issue | Solution |
|---|---|
| Port in use | `PORT=5000 pnpm dev --filter=@repo/api` |
| Module not found | `pnpm install` |
| TypeScript errors | `pnpm lint` |
| CORS errors | Update `CORS_ORIGIN` in `apps/api/.env` |
| Frontend can't find API | Update `NEXT_PUBLIC_API_URL` |
| Clean install | `rm -rf node_modules .turbo pnpm-lock.yaml && pnpm install` |

## Package Structure

```
@repo/crypto    → Encryption (used by @repo/api)
@repo/api       → Fastify backend (no external deps)
@repo/web       → Next.js frontend (no backend deps)
```

## Common edits

### Change port
**File:** `apps/api/src/server.ts`
```typescript
const PORT = Number(process.env['PORT'] ?? 4000); // Change default
```

### Change CORS
**File:** `apps/api/.env`
```bash
CORS_ORIGIN=http://your-domain:3000
```

### Change API URL in frontend
**File:** `apps/web/.env.local`
```bash
NEXT_PUBLIC_API_URL=http://your-api-domain:4000
```

### Add new endpoint
**File:** `apps/api/src/routes/transaction.ts`
```typescript
app.post('/tx/new-endpoint', async (request, reply) => {
  // Your code
});
```

### Change encryption algorithm
**File:** `packages/crypto/src/index.ts`
```typescript
// Look for 'aes-256-gcm' and change cipher/decipher calls
```

## Deployment

### Vercel (Frontend)
```bash
cd apps/web
vercel deploy
```

### Vercel/Railway (Backend)
```bash
cd apps/api
vercel deploy
# or
railway deploy
```

## Architecture

```
Browser (3000)
    ↓ HTTP
API Server (4000)
    ↓ Uses
Crypto Module (@repo/crypto)
```

## File Locations by Task

| Need to... | Edit file... |
|---|---|
| Add UI component | `apps/web/src/app/page.tsx` |
| Add API endpoint | `apps/api/src/routes/transaction.ts` |
| Change encryption | `packages/crypto/src/index.ts` |
| Change styling | `apps/web/src/app/page.module.css` |
| Add dependencies | Root `package.json` (or app-level) |
| Change ports | `.env` files or source files |
| Add types | `apps/api/src/types.ts` |

## Key Metrics

| Metric | Value |
|---|---|
| Node version | 20+ |
| TypeScript version | 5.7+ |
| Fastify version | 5+ |
| Next.js version | 15+ |
| Encryption | AES-256-GCM |
| IV size | 12 bytes |
| Key size | 256 bits (32 bytes) |
| Auth tag | 128 bits (16 bytes) |

---

**Need help?** See `README.md`, `SETUP.md`, `USAGE.md`, or `ARCHITECTURE.md`
