// Vercel serverless entrypoint - directly export the compiled app
// Since dist/ isn't always bundled, we import from source and let @vercel/node compile it
import { buildApp } from './src/app.js';

let app = null;

export default async function handler(req, res) {
  if (!app) {
    app = await buildApp();
    await app.ready();
  }
  app.server.emit('request', req, res);
}
