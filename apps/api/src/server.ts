/**
 * Local development entry-point.
 *
 * Starts the Fastify server on the port specified by the PORT env-var
 * (defaults to 4000).
 */

import { buildApp } from './app.js';

const PORT = Number(process.env['PORT'] ?? 4000);

async function main(): Promise<void> {
  const app = await buildApp();

  try {
    await app.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 API server running on http://localhost:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void main();
