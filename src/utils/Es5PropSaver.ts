export class Es5PropSaver<TObject, TValue> {
    private readonly propName = `__key_${Es5PropSaver.instanceCount++}`;

    private static instanceCount = 0;

    get(obj: TObject) {
        return (obj as any)[this.propName] as TValue | undefined;
    }

    set(obj: TObject, value: TValue) {
        Object.defineProperty(obj, this.propName, {
            configurable: true,
            enumerable: false,
            writable: false,
            value
        });
    }

    remove(obj: TObject) {
        delete (obj as any)[this.propName];
    }
}
