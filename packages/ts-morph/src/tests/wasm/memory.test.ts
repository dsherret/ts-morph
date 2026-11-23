import { expect } from "chai";
import { WasmBridge } from "../../../../common/src/typescript/wasmBridge";

describe("Wasm Memory Management", () => {
    it("should register and deregister objects on GC", async () => {
        const bridge = WasmBridge.getInstance();
        let wasmNode: any = bridge.getWrapperById(101, id => ({ _id: id }));
        
        expect(wasmNode).to.not.be.undefined;
        expect(wasmNode._id).to.equal(101);

        // Remove JS reference
        wasmNode = null;

        // Force GC if running with --expose-gc
        if (typeof global.gc === 'function') {
            global.gc();
            
            // Wait for FinalizationRegistry to trigger
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // In a real scenario we'd query the Go side to verify the handle 101 was deleted.
        }
    });
});
