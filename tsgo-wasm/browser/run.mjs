// Runs the browser acceptance test end to end:
//
//   node tsgo-wasm/browser/run.mjs
//
// Bundles ./worker.ts for the browser, serves it beside `typescript.wasm`,
// drives a headless browser at it and reports what the worker found. Exits 0
// only on `RESULT: OK`.
//
// `--serve` skips the browser and leaves the server up, for looking at the page
// by hand. `CHROME_PATH` overrides browser discovery.
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const here = fileURLToPath(new URL(".", import.meta.url));
const repoRoot = fileURLToPath(new URL("../../", import.meta.url));
const commonDist = join(repoRoot, "packages/common/dist");
const port = Number(process.env.PORT ?? 8792);
const serveOnly = process.argv.includes("--serve");

const wasmAsset = join(commonDist, "typescript.wasm");
const required = [
  join(commonDist, "ts-morph-common.browser.mjs"),
  wasmAsset,
  join(repoRoot, "packages/ts-morph/dist/ts-morph.js"),
];
for (const file of required) {
  if (!existsSync(file))
    fail(`${file} is missing. Run \`npm run build\` at the repository root first.`);
}

assertRawWasm(wasmAsset);
// The package ships one artifact, so a leftover compressed copy in the directory
// this serves from means the build is stale and the page could be served the
// wrong file.
if (existsSync(`${wasmAsset}.gz`))
  fail(`${wasmAsset}.gz exists, so the build is stale: the compiler is no longer shipped compressed. Rebuild @ts-morph/common.`);

// The shipped artifact has to be loadable as it stands, and `deno bundle` would
// hide it not being: it inlines whatever the bundle imports, so a bare specifier
// left in `ts-morph-common.browser.mjs` would never reach the browser as one.
assertImportsNothing(join(commonDist, "ts-morph-common.browser.mjs"), "the browser build of @ts-morph/common");

assertDenoBundle();
const workDir = mkdtempSync(join(tmpdir(), "ts-morph-browser-"));
const workerBundle = join(workDir, "worker.js");
console.log("bundling worker.ts for the browser…");
run("deno", ["bundle", "--quiet", "--platform", "browser", "--output", workerBundle, join(here, "worker.ts")]);
assertImportsNothing(workerBundle, "the bundle");

let settle;
const finished = new Promise(resolve => settle = resolve);

const files = {
  "/": [join(here, "index.html"), "text/html"],
  "/worker.js": [workerBundle, "text/javascript"],
  // Served as application/wasm on purpose: `WebAssembly.compileStreaming`
  // rejects anything else, in Chrome and in Node alike.
  "/typescript.wasm": [wasmAsset, "application/wasm"],
};

const server = createServer((request, response) => {
  const path = request.url.split("?")[0];
  if (request.method === "POST" && path === "/result") {
    let body = "";
    request.on("data", chunk => body += chunk);
    request.on("end", () => {
      response.writeHead(204).end();
      settle(JSON.parse(body));
    });
    return;
  }
  const entry = files[path];
  if (entry == null) {
    response.writeHead(404).end("not found");
    return;
  }
  const body = readFileSync(entry[0]);
  // `content-length` explicitly, so the page can report what it actually
  // downloaded rather than guess at it.
  response.writeHead(200, { "content-type": entry[1], "content-length": body.length, "cache-control": "no-store" });
  response.end(body);
});

server.listen(port, async () => {
  const url = `http://localhost:${port}/`;
  if (serveOnly) {
    console.log(`serving ${url} — open it in a browser; ctrl-c to stop`);
    return;
  }
  const browser = spawn(findBrowser(), [
    "--headless=new",
    "--disable-gpu",
    `--user-data-dir=${join(workDir, "profile")}`,
    "--no-first-run",
    "--no-default-browser-check",
    // a CI container usually cannot set up the sandbox, and there is nothing
    // untrusted on this page
    ...(process.env.CI ? ["--no-sandbox"] : []),
    url,
  ], { stdio: "ignore" });

  const outcome = await Promise.race([
    finished,
    new Promise(resolve => setTimeout(() => resolve({ result: "TIMED OUT", lines: [] }), 180_000)),
  ]);

  browser.kill();
  server.close();
  for (const line of outcome.lines)
    console.log(`  ${line}`);
  console.log(outcome.result === "OK" ? "browser acceptance test passed" : `browser acceptance test failed: ${outcome.result}`);
  // The browser may still be letting go of its profile directory; the temp
  // directory is the operating system's problem either way.
  try {
    rmSync(workDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
  process.exit(outcome.result === "OK" ? 0 : 1);
});

/**
 * The point of the exercise: a browser cannot resolve a bare specifier, so a
 * single one left in a module would be a page that never loads.
 */
function assertImportsNothing(bundlePath, what) {
  const source = readFileSync(bundlePath, "utf8");
  const patterns = [
    // `import x from "y"`, `export * from "y"`
    /(?:^|[\s;}])(?:import|export)[^;'"]*?from\s*["']([^"']+)["']/g,
    // `import "y"`, which imports for the side effects alone
    /(?:^|[\s;}])import\s*["']([^"']+)["']/g,
    // `import("y")`
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
  ];
  const specifiers = patterns.flatMap(pattern => [...source.matchAll(pattern)].map(match => match[1]));
  const bare = specifiers.filter(specifier => !specifier.startsWith(".") && !specifier.startsWith("/"));
  if (bare.length > 0)
    fail(`${what} still imports ${[...new Set(bare)].join(", ")}, which a browser cannot resolve`);
  console.log(`${what} imports nothing: no node built-ins, no bare specifiers`);
}

/** That the asset really is the module itself, and not wrapped in anything. */
function assertRawWasm(filePath) {
  const header = readFileSync(filePath).subarray(0, 4);
  if (header[0] !== 0x00 || header[1] !== 0x61 || header[2] !== 0x73 || header[3] !== 0x6d)
    fail(`${filePath} does not start with the WebAssembly magic word, so it is not the module a browser can compile.`);
}

/**
 * `deno bundle` is a young subcommand that this test is the only user of, so
 * say what is missing rather than leave an "unrecognized subcommand" to
 * interpret the day it is renamed or dropped.
 */
function assertDenoBundle() {
  const result = spawnSync("deno", ["bundle", "--help"], { stdio: "ignore" });
  if (result.error != null)
    fail(`deno could not be run (${result.error.code ?? result.error.message}). Install Deno: https://deno.com`);
  if (result.status !== 0) {
    fail(
      "`deno bundle` is unavailable in this Deno. Run `deno upgrade`, or bundle "
        + "tsgo-wasm/browser/worker.ts with another bundler and serve the result as worker.js.",
    );
  }
}

function findBrowser() {
  const candidates = [
    process.env.CHROME_PATH,
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
  ].filter(Boolean);
  const found = candidates.find(existsSync);
  if (found == null)
    fail("no Chrome or Edge found. Set CHROME_PATH, or use --serve and open the page yourself.");
  return found;
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0)
    fail(`\`${command} ${args.join(" ")}\` exited with code ${result.status}`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
