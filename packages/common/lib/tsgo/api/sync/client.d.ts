import { type ClientOptions, type ClientSocketOptions, type ClientSpawnOptions, type ClientWasmOptions } from "../options";
import { TimingCollector, type TimingInfo } from "../timing";
export type { ClientOptions, ClientSocketOptions, ClientSpawnOptions, ClientWasmOptions };
export declare class Client {
    private channel;
    private encoder;
    private timing;
    constructor(options: ClientOptions);
    /**
     * Wires the module resolver onto the channel.
     *
     * An empty answer on the wire means the host declined, which the compiler
     * reads as "resolve this one yourself".
     */
    private registerModuleNameResolver;
    /**
     * Wires virtual filesystem callbacks onto the channel. The wire contract is
     * transport-independent, so this is shared by the subprocess and Wasm paths.
     */
    private registerFsCallbacks;
    apiRequest<T>(method: string, params?: unknown): T;
    apiRequestBinary(method: string, params?: unknown): Uint8Array | undefined;
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
