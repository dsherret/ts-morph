import { type ClientOptions, type ClientSocketOptions, type ClientSpawnOptions, type ClientWasmOptions } from "../options";
import type { APIMethodInfo, APIRequest, BatchRequestsResponse, SourceFileResponseMethod } from "../proto";
import { TimingCollector, type TimingInfo } from "../timing";
export type { ClientOptions, ClientSocketOptions, ClientSpawnOptions, ClientWasmOptions };
export declare class Client {
    private channel;
    private encoder;
    private timing;
    private maxResponseBytesPerPage;
    constructor(options: ClientOptions);
    private registerModuleNameResolver;
    private registerFsCallbacks;
    apiRequest<K extends keyof APIMethodInfo>(method: K, params?: APIMethodInfo[K]["params"]): APIMethodInfo[K]["result"];
    registerCallback(name: string, callback: (params: unknown) => unknown): () => void;
    batchRequests(requests: readonly APIRequest[]): BatchRequestsResponse;
    apiRequestBinary<K extends SourceFileResponseMethod>(method: K, params?: APIMethodInfo[K]["params"]): Uint8Array | undefined;
    echo(payload: string): string;
    echoBinary(payload: Uint8Array): Uint8Array;
    /**
     * Returns a combined timing snapshot: client-measured round-trip and byte
     * counts folded together with the server's own per-request processing time
     * (fetched via a getServerTiming request) and estimated transport overhead.
     */
    getTimingInfo(): TimingInfo;
    resetTimingInfo(): void;
    /**
     * Returns the timing collector that per-node materialization is reported
     * into, or undefined when timing collection is disabled. The returned
     * collector is the same one folded into {@link getTimingInfo}, so
     * materialization totals surface alongside request timings.
     */
    getTimingCollector(): TimingCollector | undefined;
    private recordTiming;
    close(): void;
}
