/**
 * Runs before `node server.js` in production (`npm run prod`).
 *
 * Builds the app when there is no usable build:
 *   - `.next` is missing, or
 *   - `.next` exists but is incomplete (a build that was interrupted leaves the
 *     folder behind without BUILD_ID / preview-props.json, and `next start`
 *     then crashes with ENOENT), or
 *   - the build was made from a different git commit than the one checked out
 *     (so a `git pull` followed by a restart picks up the new code).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const NEXT_DIR = path.resolve('.next');
const MARKER = path.join(NEXT_DIR, 'build-commit');
const REQUIRED = [
  path.join(NEXT_DIR, 'BUILD_ID'),
  path.join(NEXT_DIR, 'server', 'preview-props.json'),
  path.join(NEXT_DIR, 'server', 'app-paths-manifest.json'),
];

function currentCommit() {
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return null; // not a git checkout; fall back to "build exists" semantics
  }
}

function reasonToBuild() {
  if (!fs.existsSync(NEXT_DIR)) return 'no build found';
  const missing = REQUIRED.filter((f) => !fs.existsSync(f));
  if (missing.length > 0) return `build is incomplete (missing ${path.relative(NEXT_DIR, missing[0])})`;
  const commit = currentCommit();
  if (!commit) return null;
  const built = fs.existsSync(MARKER) ? fs.readFileSync(MARKER, 'utf8').trim() : '';
  if (built !== commit) return built ? `code changed since last build (${built.slice(0, 7)} -> ${commit.slice(0, 7)})` : 'build has no commit marker';
  return null;
}

const reason = reasonToBuild();
if (!reason) {
  console.log('[ensure-build] Build is current, skipping.');
  process.exit(0);
}

console.log(`[ensure-build] ${reason}, building...`);
fs.rmSync(NEXT_DIR, { recursive: true, force: true });
execSync('npx next build', { stdio: 'inherit' });

const commit = currentCommit();
if (commit) fs.writeFileSync(MARKER, commit + '\n');
console.log('[ensure-build] Build complete.');
