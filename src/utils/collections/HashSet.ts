import { Es5PropSaver } from "../Es5PropSaver";

export function createHashSet<T>(): HashSet<T> {
    if (typeof Set !== "undefined")
        return new Set<T>();
    return new Es5HashSet<T>();
}

export interface HashSet<T> {
    has(value: T): boolean;
    clear(): void;
    delete(value: T): boolean;
    add(value: T): void;
    values(): IterableIterator<T>;
}

export class Es5HashSet<T> implements HashSet<T> {
    private readonly items: { [key: string]: T; } = {};
    private readonly propSaver = new Es5PropSaver<T, string>();
    private currentId = 0;

    has(value: T) {
        const key = this.getKey(value);
        if (key == null)
            return false;
        return this.items[key] != null;
    }

    add(value: T) {
        if (this.has(value))
            return;

        this.items[this.generateNewKey(value)] = value;
    }

    delete(value: T) {
        const key = this.getKey(value);
        if (key == null || this.items[key] == null)
            return false;

        delete this.items[key];
        return true;
    }

    clear() {
        for (const key of Object.keys(this.items))
            delete this.items[key];
    }

    *values() {
        for (const key of Object.keys(this.items))
            yield this.items[key];
    }

    private generateNewKey(value: T) {
        let id: string;

        if (typeof value === "string" || typeof value === "number")
            id = value.toString();
        else {
            id = (this.currentId++).toString();
            this.propSaver.set(value, id);
        }

        return id;
    }

    private getKey(value: T) {
        if (typeof value === "string" || typeof value === "number")
            return value.toString();
        return this.propSaver.get(value);
    }
}
