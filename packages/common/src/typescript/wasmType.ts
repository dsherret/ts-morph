import { WasmBridge } from './wasmBridge';

export class WasmType {
    public _id: number;
    private bridge: WasmBridge;

    constructor(id: number) {
        this._id = id;
        this.bridge = WasmBridge.getInstance();
    }

    get flags(): number {
        return this.bridge.getWasm().getTypeFlags(this._id);
    }

    get symbol(): any {
        const symId = this.bridge.getWasm().getTypeSymbol(this._id);
        if (symId === 0) return undefined;
        // In reality, would return a WasmSymbol
        return { _id: symId };
    }
}
