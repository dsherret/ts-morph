import fs from 'fs';
import path from 'path';

// Import the Go Wasm Shim (this assumes it's bundled or available locally)
// @ts-ignore
import { Go } from '../../lib/wasm_exec.js';

export async function loadWasm(): Promise<void> {
    const go = new Go();
    
    // Support multiple environments
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        // Node.js
        const wasmPath = path.resolve(__dirname, '../../lib/typescript.opt.wasm');
        const buffer = fs.readFileSync(wasmPath);
        const result = await WebAssembly.instantiate(buffer, go.importObject);
        go.run(result.instance);
    } else if (typeof Deno !== 'undefined') {
        // Deno
        // @ts-ignore
        const buffer = await Deno.readFile(new URL('../../lib/typescript.opt.wasm', import.meta.url));
        const result = await WebAssembly.instantiate(buffer, go.importObject);
        go.run(result.instance);
    } else {
        // Browser fallback
        const response = await fetch('/typescript.opt.wasm');
        const buffer = await response.arrayBuffer();
        const result = await WebAssembly.instantiate(buffer, go.importObject);
        go.run(result.instance);
    }
}
