import { Es5PropSaver } from "../Es5PropSaver";

export interface WeakDictionary<K extends object, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): void;
    has(key: K): boolean;
    delete(key: K): void;
}

export class Es5WeakMap<K extends object, V> implements WeakDictionary<K, V> {
    private propSaver = new Es5PropSaver<K, V>();

    get(key: K) {
        return this.propSaver.get(key);
    }

    set(key: K, value: V) {
        this.propSaver.set(key, value);
    }

    has(key: K) {
        return this.propSaver.get(key) != null;
    }

    delete(key: K) {
        this.propSaver.remove(key);
    }
}
