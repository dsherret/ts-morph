import { Es5PropSaver } from "../Es5PropSaver";

export interface Dictionary<K, V> {
    readonly size: number;
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    delete(key: K): void;
    entries(): IterableIterator<[K, V]>;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    clear(): void;
}

export class Es5Map<K, V> implements Dictionary<K, V> {
    private propSaver = new Es5PropSaver<K, string>();
    private items: { [identifier: string]: [K, V]; } = {};
    private itemCount = 0;

    get size() {
        return Object.keys(this.items).length;
    }

    set(key: K, value: V) {
        const identifier = this.getIdentifier(key) || this.createIdentifier(key);
        this.items[identifier] = [key, value];
    }

    get(key: K) {
        const identifier = this.getIdentifier(key);
        if (identifier == null)
            return undefined;
        const keyValue = this.items[identifier];
        if (keyValue == null)
            return undefined;
        return keyValue[1];
    }

    has(key: K) {
        const identifier = this.getIdentifier(key);
        if (identifier == null)
            return false;
        return this.items.hasOwnProperty(identifier);
    }

    delete(key: K) {
        const identifier = this.getIdentifier(key);
        if (identifier != null)
            delete this.items[identifier];
    }

    clear() {
        this.propSaver = new Es5PropSaver();
        this.items = {};
    }

    *entries() {
        for (const key of Object.keys(this.items))
            yield this.items[key];
    }

    *keys() {
        for (const entry of this.entries())
            yield entry[0];
    }

    *values() {
        for (const entry of this.entries())
            yield entry[1];
    }

    private getIdentifier(key: K) {
        if (typeof key === "string")
            return key;
        return this.propSaver.get(key);
    }

    private createIdentifier(key: K) {
        if (typeof key === "string")
            return key;

        const identifier = (this.itemCount++).toString();
        this.propSaver.set(key, identifier);
        return identifier;
    }
}
