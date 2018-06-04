import { Es5WeakMap, WeakDictionary } from "./Es5WeakMap";

export class WeakCache<T extends object, U> {
    private readonly cacheItems: WeakDictionary<T, U>;

    constructor() {
        if (typeof WeakMap !== undefined)
            this.cacheItems = new WeakMap<T, U>();
        else
            this.cacheItems = new Es5WeakMap();
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

    removeByKey(key: T) {
        this.cacheItems.delete(key);
    }
}
