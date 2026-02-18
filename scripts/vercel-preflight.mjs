import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();

function loadJson(relativePath) {
  const absolutePath = resolve(root, relativePath);
  if (!existsSync(absolutePath)) {
    throw new Error(`Missing file: ${relativePath}`);
  }

  const raw = readFileSync(absolutePath, 'utf8');
  return JSON.parse(raw);
}

function main() {
  const errors = [];

  const rootVercel = loadJson('vercel.json');
  const rootForbiddenKeys = ['buildCommand', 'installCommand', 'outputDirectory', 'framework'];

  for (const key of rootForbiddenKeys) {
    if (Object.prototype.hasOwnProperty.call(rootVercel, key)) {
      errors.push(
        `Root vercel.json must stay neutral. Remove \"${key}\" from /vercel.json and move app-specific settings into apps/web or apps/api.`,
      );
    }
  }

  const webVercel = loadJson('apps/web/vercel.json');
  if (webVercel.framework !== 'nextjs') {
    errors.push('apps/web/vercel.json must set "framework": "nextjs".');
  }
  if (
    Object.prototype.hasOwnProperty.call(webVercel, 'outputDirectory') &&
    webVercel.outputDirectory !== '.next'
  ) {
    errors.push('apps/web/vercel.json outputDirectory should be ".next" (or omit it for default Next.js behavior).');
  }

  const apiVercel = loadJson('apps/api/vercel.json');
  const hasBuilds = Array.isArray(apiVercel.builds) && apiVercel.builds.length > 0;
  const hasFunctions =
    typeof apiVercel.functions === 'object' && apiVercel.functions !== null &&
    Object.keys(apiVercel.functions).length > 0;

  if (!hasBuilds && !hasFunctions) {
    errors.push('apps/api/vercel.json must define either "builds" or "functions" for the API handler.');
  }
  if (!Array.isArray(apiVercel.routes) || apiVercel.routes.length === 0) {
    errors.push('apps/api/vercel.json must define "routes" for API request routing.');
  }

  if (errors.length > 0) {
    console.error('\n❌ Vercel preflight failed:\n');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    console.error('\nFix the above before deploying.');
    process.exit(1);
  }

  console.log('✅ Vercel preflight passed.');
  console.log('- Root config is neutral');
  console.log('- Web config is Next.js-compatible');
  console.log('- API config has routing/build setup');
}

main();
