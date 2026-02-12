# 📖 Example Usage Guide

## Quick Demo (5 minutes)

### Prerequisites

```bash
# Start from project root
cd secure-tx-monorepo
pnpm install
pnpm dev
```

Wait for both servers to start:
```
🚀 API server running on http://localhost:4000
▲ Next.js 15.1.6
- Local:        http://localhost:3000
```

### Browser Workflow

#### Step 1: Open Frontend
Go to **http://localhost:3000**

You'll see:
- Input field: "Party ID" (pre-filled: `party_123`)
- Textarea: "JSON Payload" (pre-filled: `{ "amount": 100, "currency": "AED" }`)
- Buttons: Encrypt & Save, Fetch, Decrypt
- Output sections (empty until you interact)

#### Step 2: Encrypt & Save
Click the **"🔒 Encrypt & Save"** button.

**Expected output:**
```
✅ Encrypted successfully.
Transaction ID: 550e8400-e29b-41d4-a716-446655440000
Encrypted: QWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=... (base64)
```

The transaction is now stored in the API's in-memory Map.

#### Step 3: Fetch Encrypted Record
Click the **"📥 Fetch"** button.

**Expected output:**
```
✅ Fetched encrypted record.
Encrypted: QWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo=...
```

This proves the record was stored and retrieved.

#### Step 4: Decrypt
Click the **"🔓 Decrypt"** button.

**Expected output:**
```
✅ Decrypted successfully.
Decrypted: { "amount": 100, "currency": "AED" }
```

The original payload is now revealed—partyId matched! ✨

#### Step 5: Try Wrong PartyId
Change the "Party ID" field to: `party_wrong`

Click **"🔓 Decrypt"** again.

**Expected output:**
```
❌ Failed to decrypt: PartyId mismatch
```

This is correct! The encryption key is derived from the partyId, so wrong partyId = wrong key = decryption failure.

#### Step 6: New Payload
Edit the JSON textarea to:
```json
{
  "amount": 5000,
  "currency": "USD",
  "description": "Large wire transfer"
}
```

Change Party ID back to: `party_123`

Click **"🔒 Encrypt & Save"** again.

**Expected output:**
```
✅ Encrypted successfully.
Transaction ID: 8fe6f1c8-3fb2-4a2e-9d3f-5c0e7b8f2a4d
Encrypted: ... (different base64 string)
```

New transaction is stored! The frontend now tracks this new ID.

#### Step 7: Fetch & Decrypt the New Transaction
Click **"📥 Fetch"** then **"🔓 Decrypt"**.

You can see the larger payload decrypted successfully.

---

## API + cURL Examples

### Using cURL to test the backend directly

```bash
# Test server health
curl http://localhost:4000/health
# Response: { "status": "ok" }
```

#### Create a Transaction
```bash
curl -X POST http://localhost:4000/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "partyId": "company_acme",
    "payload": {
      "accountNumber": "123456789",
      "amount": 10000,
      "currency": "EUR"
    }
  }'
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "encrypted": "Base64EncodedCiphertext..."
}
```

#### Fetch a Record
```bash
curl http://localhost:4000/tx/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "partyId": "company_acme",
  "encrypted": "Base64EncodedCiphertext..."
}
```

#### Decrypt (Correct PartyId)
```bash
curl -X POST http://localhost:4000/tx/a1b2c3d4-e5f6-7890-abcd-ef1234567890/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "partyId": "company_acme"
  }'
```

**Response:**
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "payload": {
    "accountNumber": "123456789",
    "amount": 10000,
    "currency": "EUR"
  }
}
```

#### Decrypt (Wrong PartyId)
```bash
curl -X POST http://localhost:4000/tx/a1b2c3d4-e5f6-7890-abcd-ef1234567890/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "partyId": "wrong_party"
  }'
```

**Response:** `403 Forbidden`
```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "payload": {}
}
```

---

## Encryption Algorithm Demonstration

### How the Encryption Works

```
Input Payload:
  { "amount": 100, "currency": "AED" }

PartyId:
  "party_123"

Step 1: Derive Key
  SHA256("party_123") = 64hex chars = 32 bytes

Step 2: Generate Random IV
  IV = 12 random bytes (96 bits)

Step 3: Encrypt
  AES-256-GCM(
    plaintext = JSON.stringify(payload),
    key = derived_key,
    iv = random_iv,
    aad = null
  )

Step 4: Get Auth Tag
  authTag = cipher.getAuthTag() = 16 bytes

Step 5: Pack & Encode
  packed = IV (12B) + authTag (16B) + ciphertext
  output = base64(packed)

Output:
  "QWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo..."
```

### Why This is Secure

1. **Different IV each time** → Same plaintext + partyId = different ciphertext
2. **Auth tag** → Detects tampering (if 1 bit changes in ciphertext, decryption fails)
3. **Key derivation** → No keys stored, only partyId needed
4. **AES-256** → Military-grade encryption (256-bit keys)
5. **GCM mode** → Authenticated encryption (both secrecy and authenticity)

---

## Programmatic Usage (Node.js / TypeScript)

### Using the Crypto Package Directly

```typescript
import { encrypt, decrypt } from '@repo/crypto';

// Encrypt
const data = { amount: 100, currency: 'AED' };
const partyId = 'party_123';

const encrypted = encrypt(data, partyId);
console.log('Encrypted:', encrypted);
// Output: "QWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXo..."

// Decrypt
const decrypted = decrypt(encrypted, partyId);
console.log('Decrypted:', decrypted);
// Output: { amount: 100, currency: 'AED' }

// Try wrong partyId
try {
  decrypt(encrypted, 'wrong_party');
} catch (err) {
  console.error('Decryption failed:', err.message);
  // Output: Error (auth tag mismatch)
}
```

### Using the API from Node.js

```typescript
import axios from 'axios';

const API_URL = 'http://localhost:4000';

// Encrypt and save
const response = await axios.post(`${API_URL}/tx/encrypt`, {
  partyId: 'party_123',
  payload: { amount: 100, currency: 'AED' },
});

const { id, encrypted } = response.data;
console.log('Stored transaction:', id);

// Later: decrypt
const decrypted = await axios.post(
  `${API_URL}/tx/${id}/decrypt`,
  { partyId: 'party_123' },
);

console.log('Payload:', decrypted.data.payload);
```

---

## Error Scenarios

### Invalid JSON
**Input:** `partyId = "test"`, Payload = `{ invalid json }`

**Action:** Click "Encrypt & Save"

**Result:**
```
❌ Invalid JSON in payload
```

### Missing PartyId
**Input:** PartyId field is empty

**Action:** Click "Encrypt & Save"

**Result:**
```
❌ Failed to encrypt: ... (400 Bad Request)
```

### Non-existent Transaction ID
**Action:** Manually change Transaction ID to `fake-id-123` and click "Fetch"

**Result:**
```
❌ Failed to fetch: ... (404 Not Found)
```

### Tampered Ciphertext
**Action:** Edit the encrypted base64 string (change 1 character) and try to decrypt

**Result:**
```
❌ Failed to decrypt: ... (Bad authentication tag)
```

---

## Performance Testing

### Measure Encryption Time

```bash
# Terminal 1: Start API
pnpm dev --filter=@repo/api

# Terminal 2: Run test
curl -w "\nTime: %{time_total}s\n" -X POST http://localhost:4000/tx/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "partyId": "perf_test",
    "payload": {
      "data": "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      "nested": { "level1": { "level2": { "value": 12345 } } }
    }
  }'
```

**Expected:** ~1-2ms for AES-256-GCM encryption

---

## Scaling Considerations

### Current Limitations (In-Memory)

- **Data Loss** → Restarting API loses all transactions
- **Memory Usage** → Each transaction takes ~200-500 bytes (depending on payload)
- **Single Instance** → No horizontal scaling

### For Production

Replace in-memory Map with:

1. **PostgreSQL + Prisma**
   ```typescript
   // Conceptual
   const tx = await prisma.transaction.create({
     data: { id, partyId, encrypted },
   });
   ```

2. **MongoDB + Mongoose**
   ```typescript
   const tx = new Transaction({ id, partyId, encrypted });
   await tx.save();
   ```

3. **Redis Cache** (with persistent DB)
   ```typescript
   await redis.set(id, JSON.stringify({ partyId, encrypted }));
   ```

4. **DynamoDB** (for Vercel deployment)
   ```typescript
   await dynamodb.putItem({
     TableName: 'Transactions',
     Item: { id, partyId, encrypted },
   }).promise();
   ```

---

## Next Steps

1. **Add Tests**
   ```bash
   pnpm add -D vitest @testing-library/react
   pnpm test
   ```

2. **Add Logging**
   ```bash
   pnpm add pino pino-pretty
   ```

3. **Add Database**
   ```bash
   pnpm add prisma
   pnpm add @prisma/client
   ```

4. **Deploy to Vercel**
   ```bash
   vercel deploy
   ```

5. **Add Authentication**
   ```bash
   pnpm add @auth/fastify-auth
   ```

---

**Happy encrypting! 🔐**
