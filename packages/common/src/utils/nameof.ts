export namespace nameof {
    export function property<TObject, TProperty extends keyof TObject>(_obj: TObject, key: TProperty): TProperty {
        return key;
    }
}
