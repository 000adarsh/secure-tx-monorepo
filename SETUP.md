# Local development setup guide

## Step-by-step instructions

### 1. Install Node.js 20+
```bash
# Check your Node version
node --version
# Should be v20.0.0 or higher
```

### 2. Install pnpm
```bash
npm install -g pnpm@9.15.4
```

### 3. Clone and install
```bash
pnpm install
```

### 4. Set environment variables

#### API (`apps/api/.env`)
```bash
cp apps/api/.env.example apps/api/.env
```

Optional customization:
```
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

#### Web (`apps/web/.env.local`)
```bash
cp apps/web/.env.example apps/web/.env.local
```

Optional customization:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

### 5. Start development servers
```bash
pnpm dev
```

Both servers start in parallel:
- Frontend: http://localhost:3000
- API: http://localhost:4000

### 6. Test the flow

1. Open http://localhost:3000 in your browser
2. Default values are pre-filled
3. Click "🔒 Encrypt & Save"
4. Click "📥 Fetch" to verify storage
5. Click "🔓 Decrypt" to retrieve original payload
6. Try changing the partyId and decrypting → should fail gracefully

## Testing individual services

### Test API only
```bash
pnpm dev --filter=@repo/api

# In another terminal, test with curl
curl -X POST http://localhost:4000/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "partyId": "test_party",
    "payload": { "test": true }
  }'
```

### Test frontend only (with mock API)
```bash
pnpm dev --filter=@repo/web
# Frontend will fail to connect to API, but code is correct
```

## Building for production

```bash
pnpm build
```

Then run:
```bash
# API
cd apps/api && pnpm start

# Web
cd apps/web && pnpm start
```

## Troubleshooting

### Port conflicts
If port 3000 or 4000 is in use:
```bash
# Use different port for API
PORT=5000 pnpm dev --filter=@repo/api

# Then update NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Module resolution issues
```bash
# Clean install
rm -rf node_modules .turbo
pnpm install
```

### TypeScript errors
```bash
# Check compilation
pnpm lint
```

## Next steps

1. **Replace in-memory storage** → Add PostgreSQL with Prisma
2. **Add authentication** → JWT tokens
3. **Add tests** → Vitest for units, Playwright for E2E
4. **Deploy** → Set up CI/CD with GitHub Actions
5. **Monitor** → Add logging (Pino) and observability

---

See [README.md](./README.md) for detailed documentation.
