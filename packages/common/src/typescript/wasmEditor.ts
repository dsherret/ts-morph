import { WasmBridge } from './wasmBridge';

export interface TextChange {
    start: number;
    end: number;
    newText: string;
}

export function updateTextSpan(sourceFileId: number, changes: TextChange[]) {
    const bridge = WasmBridge.getInstance();
    const wasm = bridge.getWasm();
    
    let newRootId = sourceFileId;
    for (const change of changes) {
        newRootId = wasm.updateTextSpan(sourceFileId, change.start, change.end, change.newText);
    }
    
    // Clear weak map entries because node IDs have changed and are invalid
    // We would need to emit an event or rebuild the ast proxy nodes here.
    return newRootId;
}

export function formatNode(nodeId: number): string {
    const bridge = WasmBridge.getInstance();
    return bridge.getWasm().formatNode(nodeId);
}
