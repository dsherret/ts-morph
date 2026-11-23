import { WasmBridge } from './wasmBridge';

export class WasmSymbol {
    public _id: number;
    private bridge: WasmBridge;

    constructor(id: number) {
        this._id = id;
        this.bridge = WasmBridge.getInstance();
    }

    get flags(): number {
        return this.bridge.getWasm().getSymbolFlags(this._id);
    }

    get escapedName(): string {
        return this.bridge.getWasm().getSymbolName(this._id);
    }
}
