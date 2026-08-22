import { expect } from "chai";
import { WasmBridge } from "../../../../common/src/typescript/wasmBridge";

describe("Wasm Object Identity Cache", () => {
    it("should return the exact same JS object instance for the same Wasm ID", () => {
        const bridge = WasmBridge.getInstance();
        
        const nodeA = bridge.getWrapperById(505, id => ({ _id: id }));
        const nodeB = bridge.getWrapperById(505, id => ({ _id: id }));
        
        expect(nodeA).to.equal(nodeB); // Strict equality
    });
});
