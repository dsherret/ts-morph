import { type ClientOptions, type ClientSocketOptions, type ClientSpawnOptions } from "../options";
import type { APIMethodInfo, SourceFileResponseMethod } from "../proto";
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
    private timing;
    constructor(options: ClientOptions);
    connect(): Promise<void>;
    private connectViaSpawn;
    private connectViaSocket;
    private registerFSCallbacks;
    apiRequest<K extends keyof APIMethodInfo>(method: K, params: APIMethodInfo[K]["params"]): Promise<APIMethodInfo[K]["result"]>;
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
