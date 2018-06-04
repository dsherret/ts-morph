import { ArrayUtils } from "../ArrayUtils";
import { Dictionary, Es5Map } from "./Es5Map";

export class KeyValueCache<T, U> {
    private readonly cacheItems: Dictionary<T, U>;

    constructor() {
        if (typeof Map !== undefined)
            this.cacheItems = new Map<T, U>();
        else
            this.cacheItems = new Es5Map<T, U>();
    }

    getSize() {
        return this.cacheItems.size;
    }

    getValues() {
        return this.cacheItems.values();
    }

    getValuesAsArray() {
        return ArrayUtils.from(this.getValues());
    }

    getKeys() {
        return this.cacheItems.keys();
    }

    getEntries() {
        return this.cacheItems.entries();
    }

    getOrCreate<TCreate extends U = U>(key: T, createFunc: () => TCreate) {
        let item = this.get(key) as TCreate;

        if (item == null) {
            item = createFunc();
            this.set(key, item);
        }

        return item;
    }

    has(key: T) {
        return this.cacheItems.has(key);
    }

    get(key: T) {
        return this.cacheItems.get(key);
    }

    set(key: T, value: U) {
        this.cacheItems.set(key, value);
    }

    replaceKey(key: T, newKey: T) {
        if (!this.cacheItems.has(key))
            throw new Error("Key not found.");
        const value = this.cacheItems.get(key)!;
        this.cacheItems.delete(key);
        this.cacheItems.set(newKey, value);
    }

    removeByKey(key: T) {
        this.cacheItems.delete(key);
    }

    clear() {
        this.cacheItems.clear();
    }
}
