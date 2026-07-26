/**
 * Safer version of `Function` which should not be called.
 * Every function should be assignable to this, but this should not be assignable to every function.
 */
export type AnyFunction = (...args: never[]) => void;
/**
 * Type of objects whose values are all of the same type.
 * The `in` and `for-in` operators can *not* be safely used,
 * since `Object.prototype` may be modified by outside code.
 */
export interface MapLike<T> {
    [index: string]: T;
}
/**
 * Indicates whether a map-like contains an own property with the specified key.
 *
 * @param map A map-like.
 * @param key A property key.
 */
export declare function hasProperty(map: MapLike<any>, key: string): boolean;
export declare function assertNever(member: never, message?: string, stackCrawlMark?: AnyFunction): never;
export declare function fail(message?: string, stackCrawlMark?: AnyFunction): never;
//# sourceMappingURL=utils.d.ts.map