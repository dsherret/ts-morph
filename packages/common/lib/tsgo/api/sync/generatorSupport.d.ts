import type { APIMethodInfo, APIRequest, APIResponse } from "../proto";
export declare function cacheGeneratorMethod<Sync extends (...args: any[]) => any, Gen extends (...args: any[]) => AnyAPIRequestGenerator>(owner: object, name: PropertyKey, sync: Sync, gen: Gen): Sync & {
    readonly gen: Gen;
};
export declare function apiRequest<Method extends keyof APIMethodInfo>(method: Method, params: APIMethodInfo[Method]["params"]): Generator<APIRequest, APIMethodInfo[Method]["result"], APIResponse["result"]>;
declare const deferredGeneratorMarker: unique symbol;
interface DeferredAPIRequest {
    readonly method: "__defer";
    readonly deferred: APIRequestGenerator;
}
interface AllAPIRequest {
    readonly method: "__all";
    readonly generators: readonly AnyAPIRequestGenerator[];
}
type APIRequestGeneratorYield = APIRequest | readonly APIRequest[] | DeferredAPIRequest | AllAPIRequest;
export type APIRequestGenerator<Return = any> = Generator<APIRequestGeneratorYield, Return, any>;
export type DeferredAPIRequestGenerator = Generator<DeferredAPIRequest, void, unknown> & {
    readonly [deferredGeneratorMarker]: true;
};
export type AllAPIRequestGenerator<Return = any> = Generator<AllAPIRequest, Return, Return>;
export type AnyAPIRequestGenerator<Return = any> = APIRequestGenerator<Return> | DeferredAPIRequestGenerator | AllAPIRequestGenerator<Return>;
type GeneratorReturn<T> = T extends Generator<any, infer R, any> ? R : never;
export type ExecutedGeneratorsResults<T extends readonly AnyAPIRequestGenerator[]> = number extends T["length"] ? GeneratorReturn<Exclude<T[number], DeferredAPIRequestGenerator>>[] : T extends readonly [infer Head extends AnyAPIRequestGenerator, ...infer Tail extends readonly AnyAPIRequestGenerator[]] ? Head extends DeferredAPIRequestGenerator ? ExecutedGeneratorsResults<Tail> : [GeneratorReturn<Head>, ...ExecutedGeneratorsResults<Tail>] : [];
interface GeneratorResponse {
    result: unknown;
    error?: string | undefined;
}
export declare function all<const T extends readonly AnyAPIRequestGenerator[]>(...requestGenerators: T): AllAPIRequestGenerator<ExecutedGeneratorsResults<T>>;
export declare function executeRequestGenerators<T extends readonly AnyAPIRequestGenerator[]>(requestGenerators: T, executeRequests: (requests: APIRequest[]) => readonly GeneratorResponse[]): ExecutedGeneratorsResults<T>;
export declare function defer(gen: APIRequestGenerator): DeferredAPIRequestGenerator;
export {};
