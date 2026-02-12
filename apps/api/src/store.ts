/**
 * In-memory transaction store.
 *
 * Uses a plain Map so the data lives only for the lifetime of the process.
 * Replace with a database adapter for production persistence.
 */

import type { TransactionRecord } from './types.js';

const store = new Map<string, TransactionRecord>();

/** Save a transaction record and return the id. */
export function save(id: string, record: TransactionRecord): void {
  store.set(id, record);
}

/** Retrieve a transaction record by id. Returns undefined if not found. */
export function find(id: string): TransactionRecord | undefined {
  return store.get(id);
}
