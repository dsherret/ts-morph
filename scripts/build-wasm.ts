import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import zlib from 'zlib';

const __dirname = path.resolve();

const distDir = path.join(__dirname, 'dist');
const bridgeDir = path.join(__dirname, 'packages', 'compiler-go-bridge');
const outputDir = path.join(__dirname, 'packages', 'common', 'lib');
const unoptimizedWasm = path.join(distDir, 'ts-go-unoptimized.wasm');
const optimizedWasm = path.join(outputDir, 'typescript.opt.wasm');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Building unoptimized Go Wasm...');
execSync(`go build -ldflags="-s -w" -trimpath -o "${unoptimizedWasm}" ./packages/compiler-go-bridge`, {
  env: { ...process.env, GOOS: 'js', GOARCH: 'wasm' },
  stdio: 'inherit'
});

const getFileSize = (filePath) => fs.statSync(filePath).size;
const formatSize = (bytes) => (bytes / 1024 / 1024).toFixed(2) + ' MB';

const unoptimizedSize = getFileSize(unoptimizedWasm);
console.log(`Unoptimized Size: ${formatSize(unoptimizedSize)}`);

console.log('Running wasm-opt for size optimization...');
try {
  execSync(`npx wasm-opt --all-features -Oz --strip-debug --strip-producers --strip-dwarf --dce "${unoptimizedWasm}" -o "${optimizedWasm}"`, { stdio: 'inherit' });
} catch (e) {
  console.error("wasm-opt failed, please ensure it's installed or run `npm install`");
  process.exit(1);
}

const optimizedSize = getFileSize(optimizedWasm);

console.log('Compressing with Gzip...');
const wasmBuffer = fs.readFileSync(optimizedWasm);
const gzipped = zlib.gzipSync(wasmBuffer, { level: 9 });
const gzippedSize = gzipped.length;

console.log('Compressing with Brotli...');
const brotli = zlib.brotliCompressSync(wasmBuffer, {
  params: {
    [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
  }
});
const brotliSize = brotli.length;

console.log('\n--- Filesize Comparisons ---');
console.log(`Baseline Go Wasm:     N/A (unstripped is usually >18MB)`);
console.log(`Stripped (-s -w):     ${formatSize(unoptimizedSize)}`);
console.log(`wasm-opt (-Oz):       ${formatSize(optimizedSize)}`);
console.log(`Gzipped (Level 9):    ${formatSize(gzippedSize)}`);
console.log(`Brotli (Level 11):    ${formatSize(brotliSize)}`);
console.log('----------------------------\n');

if (optimizedSize > 10 * 1024 * 1024) {
  console.error(`ERROR: Optimized Wasm size (${formatSize(optimizedSize)}) exceeds 10MB limit!`);
  process.exit(1);
}

if (brotliSize > 2.5 * 1024 * 1024) {
  console.error(`ERROR: Compressed Wasm size (${formatSize(brotliSize)}) exceeds 2.5MB limit!`);
  process.exit(1);
}

console.log('Copying and modifying wasm_exec.js...');
const goRoot = execSync('go env GOROOT').toString().trim();
let wasmExecPath = path.join(goRoot, 'misc', 'wasm', 'wasm_exec.js');
if (!fs.existsSync(wasmExecPath)) {
  wasmExecPath = path.join(goRoot, 'lib', 'wasm', 'wasm_exec.js');
}
let wasmExecContent = fs.readFileSync(wasmExecPath, 'utf-8');

// Modify the shim to support CommonJS and ESM natively
wasmExecContent = wasmExecContent.replace(
  'if (!globalThis.require) {',
  'if (false) {' // Prevent require from throwing in strict ESM if needed, or customize
);
// Make it an exportable module
wasmExecContent += `
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Go };
} else if (typeof exports !== 'undefined') {
  exports.Go = Go;
}
`;
fs.writeFileSync(path.join(outputDir, 'wasm_exec.js'), wasmExecContent);

console.log('Generating inline Base64 Wasm module for bundlers...');
const base64Wasm = wasmBuffer.toString('base64');
const inlineJsContent = `// Auto-generated inline WebAssembly binary
export const WasmBase64 = "${base64Wasm}";
`;
fs.writeFileSync(path.join(outputDir, 'typescript.inline.js'), inlineJsContent);

console.log('Wasm build pipeline completed successfully.');
