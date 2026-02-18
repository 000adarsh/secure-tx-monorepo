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
  app.get('/api/health', async () => ({ status: 'ok' }));

  // Transaction routes.
  // Register both root and /api-prefixed routes to support local dev and
  // Vercel route prefixing behavior.
  await app.register(transactionRoutes);
  await app.register(transactionRoutes, { prefix: '/api' });

  return app;
}

// Vercel serverless handler
let app: Awaited<ReturnType<typeof buildApp>> | null = null;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await buildApp();
    await app.ready();
  }
  
  // Forward the request to Fastify
  app.server.emit('request', req, res);
}
