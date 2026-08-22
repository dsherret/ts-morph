export class WasmBridge {
    private static instance: WasmBridge;
    private finalizationRegistry: FinalizationRegistry<number>;
    private nodeCache: WeakMap<object, number>;
    private idToNodeCache: Map<number, WeakRef<any>>;

    private constructor() {
        this.idToNodeCache = new Map();
        this.nodeCache = new WeakMap();

        // When a JS wrapper object is garbage collected by V8, 
        // the FinalizationRegistry will call this callback with the Wasm Handle ID.
        this.finalizationRegistry = new FinalizationRegistry((handleId: number) => {
            this.idToNodeCache.delete(handleId);
            // Notify the Go Wasm runtime to delete the underlying struct reference.
            if (typeof (globalThis as any).__TS_GO_WASM__?.free === 'function') {
                (globalThis as any).__TS_GO_WASM__.free(handleId);
            }
        });
    }

    public static getInstance(): WasmBridge {
        if (!WasmBridge.instance) {
            WasmBridge.instance = new WasmBridge();
        }
        return WasmBridge.instance;
    }

    public registerWrapper(wrapper: any, id: number) {
        this.finalizationRegistry.register(wrapper, id);
        this.nodeCache.set(wrapper, id);
        this.idToNodeCache.set(id, new WeakRef(wrapper));
    }

    public getWrapperById<T>(id: number, factory: (id: number) => T): T | null {
        if (id === 0) return null;
        
        const cachedRef = this.idToNodeCache.get(id);
        if (cachedRef) {
            const cachedObj = cachedRef.deref();
            if (cachedObj !== undefined) {
                return cachedObj as T;
            }
        }

        const newWrapper = factory(id);
        this.registerWrapper(newWrapper, id);
        return newWrapper;
    }
    
    public getWasm() {
        return (globalThis as any).__TS_GO_WASM__;
    }
}
