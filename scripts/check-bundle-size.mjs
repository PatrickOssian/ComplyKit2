// Guards against silently growing past Cloudflare's Worker script size cap.
// Run after `opennextjs-cloudflare build`, before deploying — wired into
// the Cloudflare Workers Builds "Build command" so it runs on every push.
//
// `.open-next/worker.js` is just a thin entry shim (a few KB); the real
// deployed artifact only exists after esbuild resolves and inlines every
// import, which is what `wrangler deploy` does at deploy time. We get that
// same bundle via `wrangler deploy --dry-run --outdir`, without actually
// deploying, and measure *that* file — which also correctly excludes
// static assets (served separately via the ASSETS binding, under a much
// more generous limit) that wrangler's own "Total Upload" log line lumps
// in with the script.
//
// Thresholds assume the Workers FREE plan's 3 MB gzip cap (the safer floor —
// if this account is on the Paid plan, which allows 10 MB, raise these).

import { execSync } from "node:child_process";
import { gzipSync } from "node:zlib";
import { readFileSync, rmSync } from "node:fs";

const OUTDIR = ".bundle-check-tmp";
const MB = 1024 * 1024;
const WARN_AT = 2 * MB; // heads-up well before the cap
const FAIL_AT = 2.7 * MB; // 90% of the Free plan's 3 MB gzip limit

function formatMb(bytes) {
  return `${(bytes / MB).toFixed(2)} MB`;
}

try {
  execSync(`npx wrangler deploy --dry-run --outdir=${OUTDIR}`, { stdio: "pipe" });

  const raw = readFileSync(`${OUTDIR}/worker.js`);
  const gzipped = gzipSync(raw, { level: 9 });
  const pctOfCap = (gzipped.length / (3 * MB)) * 100;

  console.log(
    `Bundle size: ${formatMb(raw.length)} raw / ${formatMb(gzipped.length)} gzip (${pctOfCap.toFixed(0)}% of the Free plan's 3 MB gzip cap)`,
  );

  if (gzipped.length >= FAIL_AT) {
    console.error(`✗ Bundle-size check FAILED: ${formatMb(gzipped.length)} gzip exceeds the ${formatMb(FAIL_AT)} threshold.`);
    console.error("  Deploy would likely be rejected by Cloudflare, or leave very little headroom. Investigate what grew before deploying.");
    process.exit(1);
  }

  if (gzipped.length >= WARN_AT) {
    console.warn(`⚠ Bundle-size warning: ${formatMb(gzipped.length)} gzip is past the ${formatMb(WARN_AT)} early-warning threshold.`);
  } else {
    console.log("✓ Bundle-size check passed.");
  }
} catch (err) {
  console.error("✗ Bundle-size check could not run — did the build step (opennextjs-cloudflare build) run first?");
  console.error(err.message ?? err);
  process.exit(1);
} finally {
  rmSync(OUTDIR, { recursive: true, force: true });
}
