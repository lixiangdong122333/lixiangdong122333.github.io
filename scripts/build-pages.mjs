import { copyFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(await readFile(path.join(root, 'site.config.json'), 'utf8'));
const repository = process.env.GITHUB_REPOSITORY || config.repository;
const [owner, repositoryName] = repository.split('/');

if (!owner || !repositoryName) {
  throw new Error(`Invalid GitHub repository: ${repository}`);
}

const isUserSite = repositoryName.toLowerCase() === `${owner}.github.io`.toLowerCase();
const baseHref = isUserSite ? '/' : `/${repositoryName}/`;
const siteUrl = `https://${owner}.github.io${isUserSite ? '' : `/${repositoryName}`}`;
const environment = { ...process.env, BASE_HREF: baseHref, SITE_URL: siteUrl };

function runNode(script, argumentsList = []) {
  const result = spawnSync(process.execPath, [script, ...argumentsList], {
    cwd: root,
    env: environment,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

runNode(path.join(root, 'scripts', 'generate-content.mjs'));
runNode(path.join(root, 'node_modules', '@angular', 'cli', 'bin', 'ng.js'), [
  'build',
  '--configuration',
  'pages',
  '--base-href',
  baseHref,
]);

const browserOutput = path.join(root, 'dist', 'xiangdong-lab', 'browser');
const prerenderedNotFound = path.join(browserOutput, '404', 'index.html');
try {
  await stat(prerenderedNotFound);
  await copyFile(prerenderedNotFound, path.join(browserOutput, '404.html'));
} catch {
  console.warn('The prerendered 404 page was not found; no root 404.html was copied.');
}

console.log(`GitHub Pages artifact built for ${siteUrl} with base href ${baseHref}`);
