/**
 * Vercel serverless entry-point.
 *
 * Exports the Fastify app as a serverless function handler compatible with
 * Vercel's Node.js runtime.
 */

import { buildApp } from '../src/app.js';

let app: Awaited<ReturnType<typeof buildApp>> | null = null;

export default async function handler(req: any, res: any) {
  if (!app) {
    app = await buildApp();
    await app.ready();
  }
  
  // Forward the request to Fastify
  app.server.emit('request', req, res);
}
