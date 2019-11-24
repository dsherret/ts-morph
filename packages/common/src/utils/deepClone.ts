/**
 * Deep clones an object not maintaining references.
 * @remarks If this has a circular reference it will go forever so be careful.
 */
export function deepClone<T extends object>(objToClone: T): T {
    return clone(objToClone) as T;

    function clone(obj: object) {
        const newObj = Object.create(obj.constructor.prototype) as object;

        for (const propName of Object.keys(obj))
            (newObj as any)[propName] = cloneItem((obj as any)[propName]);

        return newObj;
    }

    function cloneArray(array: unknown[]): unknown[] {
        return array.map(cloneItem);
    }

    function cloneItem(item: unknown) {
        if (item instanceof Array)
            return cloneArray(item);
        else if (typeof item === "object")
            return item === null ? item : clone(item);
        return item;
    }
}
