/**
 * Transaction routes — /tx/*
 *
 * POST /tx/encrypt   — encrypt a payload and store it
 * GET  /tx/:id       — fetch the encrypted record (no decryption)
 * POST /tx/:id/decrypt — decrypt a stored record after validating the partyId
 */

import { randomUUID } from 'node:crypto';
import type { FastifyInstance } from 'fastify';
import { encrypt, decrypt } from '../crypto.js';
import { save, find } from '../store.js';
import type {
  EncryptRequestBody,
  EncryptResponse,
  DecryptRequestBody,
  DecryptResponse,
  FetchResponse,
  IdParam,
} from '../types.js';

export async function transactionRoutes(app: FastifyInstance): Promise<void> {
  /**
   * POST /tx/encrypt
   * Encrypts the provided payload with the given partyId and persists the
   * result in the in-memory store.
   */
  app.post<{ Body: EncryptRequestBody; Reply: EncryptResponse }>(
    '/tx/encrypt',
    async (request, reply) => {
      const { partyId, payload } = request.body;

      if (!partyId || typeof partyId !== 'string') {
        return reply.status(400).send({ id: '', encrypted: '' });
      }
      if (!payload || typeof payload !== 'object') {
        return reply.status(400).send({ id: '', encrypted: '' });
      }

      const encrypted = encrypt(payload, partyId);
      const id = randomUUID();

      save(id, { partyId, encrypted });

      return reply.status(201).send({ id, encrypted });
    },
  );

  /**
   * GET /tx/:id
   * Returns the stored encrypted record without decrypting it.
   */
  app.get<{ Params: IdParam; Reply: FetchResponse }>(
    '/tx/:id',
    async (request, reply) => {
      const { id } = request.params;
      const record = find(id);

      if (!record) {
        return reply.status(404).send({ id, partyId: '', encrypted: '' });
      }

      return reply.send({ id, partyId: record.partyId, encrypted: record.encrypted });
    },
  );

  /**
   * POST /tx/:id/decrypt
   * Validates that the supplied partyId matches the stored record, then
   * decrypts and returns the original payload.
   */
  app.post<{ Params: IdParam; Body: DecryptRequestBody; Reply: DecryptResponse }>(
    '/tx/:id/decrypt',
    async (request, reply) => {
      const { id } = request.params;
      const { partyId } = request.body;

      if (!partyId || typeof partyId !== 'string') {
        return reply.status(400).send({ id, payload: {} });
      }

      const record = find(id);

      if (!record) {
        return reply.status(404).send({ id, payload: {} });
      }

      if (record.partyId !== partyId) {
        return reply.status(403).send({ id, payload: {} });
      }

      try {
        const payload = decrypt(record.encrypted, partyId);
        return reply.send({ id, payload });
      } catch {
        return reply.status(400).send({ id, payload: {} });
      }
    },
  );
}
