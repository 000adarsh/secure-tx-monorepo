/**
 * Fastify application factory.
 *
 * Creates a configured Fastify instance with CORS enabled and transaction
 * routes registered.  Exported so it can be used both by the local dev
 * server and by serverless entry-points (e.g. Vercel).
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { transactionRoutes } from './routes/transaction.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Enable CORS for all origins during development.
  // In production, restrict to your frontend domain via env vars.
  await app.register(cors, {
    origin: process.env['CORS_ORIGIN'] ?? true,
  });

  // Health-check endpoint.
  app.get('/health', async () => ({ status: 'ok' }));

  // Transaction routes.
  await app.register(transactionRoutes);

  return app;
}
