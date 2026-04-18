import { WasmBridge } from './wasmBridge';
import { WasmNode } from './wasmNode';

export class WasmSourceFile extends WasmNode {
    constructor(id: number) {
        super(id);
    }

    get fileName(): string {
        const bridge = WasmBridge.getInstance();
        return bridge.getWasm().getSourceFileName(this._id);
    }

    get text(): string {
        const bridge = WasmBridge.getInstance();
        return bridge.getWasm().getSourceFileText(this._id);
    }
}
