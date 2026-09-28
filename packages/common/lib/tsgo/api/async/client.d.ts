/// <reference lib="esnext.disposable" />
import { type ClientOptions, type ClientSocketOptions, type ClientSpawnOptions } from "../options";
import type { APIMethodInfo, APIRequest, SourceFileResponseMethod } from "../proto";
import { TimingCollector, type TimingInfo } from "../timing";
export type { ClientOptions, ClientSocketOptions, ClientSpawnOptions };
/**
 * Client handles communication with the TypeScript API server
 * over STDIO (spawned process) or a Unix domain socket using JSON-RPC.
 */
export declare class Client {
    private socket;
    private process;
    private connection;
    private options;
    private connected;
    private closed;
    private connecting;
    private timing;
    private batchedRequests;
    private nextBatch;
    constructor(options: ClientOptions);
    connect(): Promise<void>;
    private connectWorker;
    private connectViaSpawn;
    private connectViaSocket;
    private registerFSCallbacks;
    private sendRequestWithTiming;
    registerCallback(name: string, callback: (params: unknown) => unknown | Promise<unknown>): () => void;
    private doBatch;
    private scheduleImmediateBatch;
    batchContext(): {
        [Symbol.dispose](): void;
    };
    apiRequest<K extends APIRequest["method"]>(method: K, params: APIMethodInfo[K]["params"]): Promise<APIMethodInfo[K]["result"]>;
    apiRequestBinary<K extends SourceFileResponseMethod>(method: K, params: APIMethodInfo[K]["params"]): Promise<Uint8Array | undefined>;
    /**
     * Returns the timing collector that per-node materialization is reported
     * into, or undefined when timing collection is disabled. The returned
     * collector is the same one folded into {@link getTimingInfo}, so
     * materialization totals surface alongside request timings.
     */
    getTimingCollector(): TimingCollector | undefined;
    /**
     * Returns a combined timing snapshot: client-measured round-trip and byte
     * counts folded together with the server's own per-request processing time
     * (fetched via a getServerTiming request) and estimated transport overhead.
     */
    getTimingInfo(): Promise<TimingInfo>;
    resetTimingInfo(): Promise<void>;
    private fetchServerTiming;
    close(): Promise<void>;
}
