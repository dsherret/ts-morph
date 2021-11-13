export namespace nameof {
    export function property<TObject, TProperty extends keyof TObject>(obj: TObject, key: TProperty): TProperty;
    export function property<TObject, TProperty extends keyof TObject>(key: TProperty): TProperty;
    export function property(key1: any, key2?: any): any {
        return key2 ?? key1;
    }
}
