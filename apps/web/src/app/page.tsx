'use client';

import { useState } from 'react';
import styles from './page.module.css';

interface TransactionState {
  partyId: string;
  payload: string;
  transactionId: string;
  encrypted: string;
  decrypted: string;
  loading: boolean;
  error: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function Home() {
  const [state, setState] = useState<TransactionState>({
    partyId: 'party_123',
    payload: JSON.stringify({ amount: 100, currency: 'AED' }, null, 2),
    transactionId: '',
    encrypted: '',
    decrypted: '',
    loading: false,
    error: '',
  });

  /** Validate and parse JSON payload. */
  function parsePayload(): Record<string, unknown> | null {
    try {
      return JSON.parse(state.payload);
    } catch {
      setState((s) => ({ ...s, error: '❌ Invalid JSON in payload' }));
      return null;
    }
  }

  /** POST /tx/encrypt — encrypt and save. */
  async function handleEncryptAndSave() {
    setState((s) => ({ ...s, loading: true, error: '', encrypted: '', transactionId: '' }));

    const payload = parsePayload();
    if (!payload) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }

    try {
      const response = await fetch(`${API_URL}/tx/encrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partyId: state.partyId,
          payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = (await response.json()) as { id: string; encrypted: string };
      setState((s) => ({
        ...s,
        encrypted: data.encrypted,
        transactionId: data.id,
        loading: false,
        error: '',
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: `❌ Failed to encrypt: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }));
    }
  }

  /** GET /tx/:id — fetch encrypted record. */
  async function handleFetch() {
    if (!state.transactionId) {
      setState((s) => ({ ...s, error: '⚠️ No transaction ID. Encrypt first.' }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: '' }));

    try {
      const response = await fetch(`${API_URL}/tx/${state.transactionId}`);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = (await response.json()) as { encrypted: string };
      setState((s) => ({
        ...s,
        encrypted: data.encrypted,
        loading: false,
        error: '✅ Fetched encrypted record.',
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: `❌ Failed to fetch: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }));
    }
  }

  /** POST /tx/:id/decrypt — decrypt the stored record. */
  async function handleDecrypt() {
    if (!state.transactionId) {
      setState((s) => ({ ...s, error: '⚠️ No transaction ID. Encrypt first.' }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: '', decrypted: '' }));

    try {
      const response = await fetch(`${API_URL}/tx/${state.transactionId}/decrypt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partyId: state.partyId }),
      });

      if (!response.ok) {
        const errorMsg =
          response.status === 403
            ? 'PartyId mismatch'
            : response.status === 404
              ? 'Transaction not found'
              : `Error ${response.status}`;
        throw new Error(errorMsg);
      }

      const data = (await response.json()) as { payload: Record<string, unknown> };
      setState((s) => ({
        ...s,
        decrypted: JSON.stringify(data.payload, null, 2),
        loading: false,
        error: '✅ Decrypted successfully.',
      }));
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: `❌ Failed to decrypt: ${err instanceof Error ? err.message : 'Unknown error'}`,
      }));
    }
  }

  const isReady = state.partyId.trim().length > 0;

  return (
    <main className={styles.container}>
      <div className={styles.card}>
        <h1>🔐 Secure Transaction Service</h1>
        <p className={styles.subtitle}>Encrypt, store, and decrypt payloads securely.</p>

        <div className={styles.grid}>
          {/* Left Column — Inputs */}
          <section className={styles.section}>
            <h2>📝 Input</h2>

            <div className={styles.formGroup}>
              <label>Party ID</label>
              <input
                type="text"
                placeholder="e.g. party_123"
                value={state.partyId}
                className={styles.textInput}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    partyId: e.target.value,
                    error: '',
                  }))
                }
              />
            </div>

            <div className={styles.formGroup}>
              <label>JSON Payload</label>
              <textarea
                placeholder='e.g. { "amount": 100, "currency": "AED" }'
                rows={6}
                value={state.payload}
                className={styles.textArea}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    payload: e.target.value,
                    error: '',
                  }))
                }
              />
            </div>

            <div className={styles.buttonGroup}>
              <button
                disabled={!isReady || state.loading}
                onClick={handleEncryptAndSave}
                className={`${styles.button} ${styles.primaryBtn}`}
              >
                {state.loading ? '⏳ Encrypting...' : '🔒 Encrypt & Save'}
              </button>
              <button
                disabled={!state.transactionId || state.loading}
                onClick={handleFetch}
                className={`${styles.button} ${styles.secondaryBtn}`}
              >
                📥 Fetch
              </button>
              <button
                disabled={!state.transactionId || state.loading}
                onClick={handleDecrypt}
                className={`${styles.button} ${styles.secondaryBtn}`}
              >
                🔓 Decrypt
              </button>
            </div>
          </section>

          {/* Right Column — Outputs */}
          <section className={styles.section}>
            <h2>📤 Output</h2>

            {state.transactionId && (
              <div className={styles.formGroup}>
                <label>Transaction ID</label>
                <input type="text" readOnly value={state.transactionId} className={styles.textInput} />
              </div>
            )}

            {state.encrypted && (
              <div className={styles.formGroup}>
                <label>Encrypted</label>
                <textarea readOnly rows={4} value={state.encrypted} className={styles.textArea} />
              </div>
            )}

            {state.decrypted && (
              <div className={styles.formGroup}>
                <label>Decrypted</label>
                <textarea readOnly rows={4} value={state.decrypted} className={styles.textArea} />
              </div>
            )}

            {state.error && <div className={styles.message}>{state.error}</div>}
          </section>
        </div>
      </div>
    </main>
  );
}
