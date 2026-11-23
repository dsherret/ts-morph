import { WasmBridge } from './wasmBridge';

export class WasmNode {
    public _id: number;
    private bridge: WasmBridge;

    constructor(id: number) {
        this._id = id;
        this.bridge = WasmBridge.getInstance();
    }

    // Example lazy getter proxy implementation
    get kind(): number {
        return this.bridge.getWasm().getNodeKind(this._id);
    }

    get parent(): WasmNode | undefined {
        const parentId = this.bridge.getWasm().getNodeParent(this._id);
        if (parentId === 0) return undefined;
        return this.bridge.getWrapperById(parentId, (id) => new WasmNode(id)) as WasmNode;
    }
}
