# 🏗 Architecture Overview

## Project Structure

```
secure-tx-monorepo/
│
├── 📁 apps/
│   ├── 📁 api/                    # Fastify Backend (Port 4000)
│   │   ├── 📁 src/
│   │   │   ├── app.ts            # Express factory
│   │   │   ├── server.ts         # Dev entry-point
│   │   │   ├── store.ts          # In-memory Map storage
│   │   │   ├── types.ts          # TypeScript interfaces
│   │   │   └── 📁 routes/
│   │   │       └── transaction.ts # /tx/* endpoints
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   └── 📁 web/                    # Next.js Frontend (Port 3000)
│       ├── 📁 src/
│       │   └── 📁 app/
│       │       ├── layout.tsx     # Root layout
│       │       ├── page.tsx       # Main UI component
│       │       ├── globals.css    # Global styles
│       │       └── page.module.css # Component styles
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.mjs
│       └── .env.example
│
├── 📁 packages/
│   └── 📁 crypto/                 # Shared Encryption Module
│       ├── 📁 src/
│       │   └── index.ts           # AES-256-GCM encrypt/decrypt
│       ├── package.json
│       └── tsconfig.json
│
├── 📄 package.json                 # Root workspace config
├── 📄 turbo.json                   # TurboRepo pipelines
├── 📄 tsconfig.json                # Root TypeScript config
├── 📄 pnpm-workspace.yaml          # pnpm workspace definition
├── 📄 .npmrc                       # npm config (shamefully-hoist)
├── 📄 .prettierrc                  # Code formatting
├── 📄 .gitignore
├── 📄 README.md                    # Full documentation
└── 📄 SETUP.md                     # Setup instructions
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Port 3000)                   │
│                       Next.js App                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Input Fields:  partyId + JSON Payload           │  │
│  │  Buttons:       Encrypt & Save / Fetch / Decrypt │  │
│  │  Output:        Encrypted + Decrypted display    │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP Requests
                       ▼
┌─────────────────────────────────────────────────────────┐
│              Fastify API (Port 4000)                     │
│  ┌──────────────────┐  ┌──────────────────────────────┐ │
│  │  POST /encrypt   │  │  Calls: encrypt(payload,     │ │
│  │  GET /:id        │  │          partyId)            │ │
│  │  POST /:decrypt  │  │  Returns: { id, encrypted }  │ │
│  └──────────────────┘  └──────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────┘
                       │ Uses
                       ▼
┌─────────────────────────────────────────────────────────┐
│         @repo/crypto Package (Node.js crypto)           │
│  ┌──────────────────────────────────────────────────┐  │
│  │  encrypt(data, partyId)                          │  │
│  │  ├─ Key = SHA256(partyId)                        │  │
│  │  ├─ IV = random 12 bytes                         │  │
│  │  └─ Encrypted = AES-256-GCM(data, key, IV)       │  │
│  │                                                   │  │
│  │  decrypt(encryptedData, partyId)                 │  │
│  │  ├─ Key = SHA256(partyId)                        │  │
│  │  └─ Decrypts & validates auth tag                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Dependency Graph

```
@repo/web (Next.js)
    └── depends on: (none - uses HTTP only)

@repo/api (Fastify)
    └── depends on: @repo/crypto

@repo/crypto (Encryption)
    └── depends on: Node.js built-ins (node:crypto)
```

## Build Pipeline (TurboRepo)

```
turbo run build
    ├── build @repo/crypto (no deps)
    └── build @repo/api (depends on crypto)
    └── build @repo/web (no deps)

turbo run dev
    ├── dev @repo/api (parallel)
    └── dev @repo/web (parallel)
    └── dev @repo/crypto (watch mode)

turbo run lint
    ├── lint @repo/api
    ├── lint @repo/web
    └── lint @repo/crypto
```

## API Endpoints

```
┌────────────────────────────────────────┐
│  POST /tx/encrypt                      │
│  Body: { partyId, payload }            │
│  Response: { id, encrypted }           │
│  Status: 201 Created / 400 Bad Request │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  GET /tx/:id                           │
│  Response: { id, partyId, encrypted }  │
│  Status: 200 OK / 404 Not Found        │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  POST /tx/:id/decrypt                  │
│  Body: { partyId }                     │
│  Response: { id, payload }             │
│  Status: 200 OK / 403 Forbidden /      │
│            404 Not Found / 400 Bad Req │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│  GET /health                           │
│  Response: { status: "ok" }            │
│  Status: 200 OK                        │
└────────────────────────────────────────┘
```

## Key Technologies

| Layer       | Technology       | Purpose                        |
|-------------|-----------------|--------------------------------|
| Frontend    | Next.js 15      | Modern React framework         |
| Frontend    | TypeScript      | Type-safe JavaScript           |
| Frontend    | CSS Modules     | Scoped styling                 |
| Backend     | Fastify 5       | High-performance web server    |
| Backend     | TypeScript      | Type-safe Node.js              |
| Encryption  | Node crypto     | Built-in AES-256-GCM           |
| Monorepo    | TurboRepo       | Fast build orchestration       |
| Package Mgr | pnpm            | Efficient dependency management|

## Security Features

✅ **Encryption at Rest**
- AES-256-GCM algorithm (NIST recommended)
- Random IV per encryption
- HMAC-based authentication tag

✅ **Key Derivation**
- SHA-256 hash of partyId
- One-way derivation (no storage needed)

✅ **Decryption Safeguards**
- PartyId validation before decryption
- Auth tag verification (detects tampering)
- Throws if signature invalid

✅ **Transmission & Storage**
- Base64 encoding for JSON compatibility
- Opaque ciphertext (no plaintext leakage)

## Performance Characteristics

| Operation | Time     | Note                        |
|-----------|----------|------------------------------|
| Encrypt   | ~1-2ms   | SHA256 + AES-256-GCM        |
| Decrypt   | ~1-2ms   | Key derivation + decryption |
| Fetch     | <1ms     | In-memory Map lookup        |

## Deployment Targets

✅ **Local Development**
```bash
pnpm install && pnpm dev
# Runs on http://localhost:3000 (web) + http://localhost:4000 (api)
```

✅ **Vercel (Web)**
```bash
vercel deploy apps/web
# Frontend scales with automatic builds
```

✅ **Vercel / Railway / Render (API)**
```bash
vercel deploy apps/api
# Backend serverless or containerized
```

✅ **Docker / Kubernetes**
```dockerfile
# Build monorepo, deploy apps separately
# See .dockerignore and Dockerfile patterns
```

---

**Last updated:** February 2026 | **Version:** 1.0.0
