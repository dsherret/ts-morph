export class WasmStringCache {
    private static cache = new Map<number, string>();

    /**
     * Resolves a Wasm string ID into a JavaScript string.
     * Prevents expensive TextDecoder operations for recurring strings (like 'length', 'undefined', identifiers).
     */
    public static getString(id: number, resolver: (id: number) => string): string {
        const cached = this.cache.get(id);
        if (cached !== undefined) {
            return cached;
        }
        
        const str = resolver(id);
        this.cache.set(id, str);
        return str;
    }

    public static clear() {
        this.cache.clear();
    }
}
