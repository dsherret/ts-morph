/**
 * Client-side collection of per-request timing and transfer measurements.
 *
 * When enabled, each request records its round-trip latency and the number of
 * payload bytes sent and received, accumulated into running totals and a
 * fixed-size ring buffer of the most recent requests.
 *
 * The server measures its own per-request processing time independently. When a
 * timing snapshot is requested, the client fetches the server's collection via
 * a `getServerTiming` request and folds it into the returned {@link TimingInfo},
 * yielding per-request and total server processing time and an estimated
 * transport overhead (round-trip minus server processing time). Normal response
 * messages are left unchanged.
 */
/** Number of most-recent requests retained in the ring buffer. */
export declare const RECENT_REQUEST_CAPACITY = 5;
/** A single request's measured timing and transfer sample. */
export interface RequestTiming {
    /** The API method that was invoked. */
    method: string;
    /** Wall-clock round-trip time measured by the client, in milliseconds. */
    roundTripMs: number;
    /** Number of request payload bytes sent to the server. */
    bytesSent: number;
    /** Number of response payload bytes received from the server. */
    bytesReceived: number;
    /** Wall-clock timestamp ({@link Date.now}) captured when the request completed. */
    timestamp: number;
    /**
     * Server-side processing time for this request, in milliseconds, as folded
     * in from the server's own timing collection. Undefined when server timing
     * for the request could not be matched.
     */
    serverTimeMs?: number;
    /**
     * Estimated transport overhead for this request, in milliseconds
     * (`roundTripMs - serverTimeMs`, clamped to be non-negative). Present
     * exactly when {@link serverTimeMs} is.
     */
    transportOverheadMs?: number;
}
/** Running totals accumulated across every measured request. */
export interface TimingAccumulators {
    /** Number of requests measured. */
    requestCount: number;
    /** Sum of round-trip latencies, in milliseconds. */
    roundTripMs: number;
    /** Sum of request payload bytes sent. */
    bytesSent: number;
    /** Sum of response payload bytes received. */
    bytesReceived: number;
    /** Sum of server-side processing time, in milliseconds. */
    serverTimeMs: number;
    /**
     * Estimated total transport overhead, in milliseconds
     * (`roundTripMs - serverTimeMs`, clamped to be non-negative).
     */
    transportOverheadMs: number;
    /**
     * Number of AST nodes materialized from binary source-file responses as the
     * client walked the returned trees. Materialization is lazy and happens on
     * demand, so this accrues after the originating request completes.
     */
    nodesMaterialized: number;
    /**
     * Number of source files fetched from the server (each decoded into a
     * lazily-materialized tree).
     */
    sourceFilesFetched: number;
    /**
     * Number of AST nodes across all fetched source files that can be
     * materialized on demand. Each fetched file contributes its full node count
     * (excluding the pre-materialized source-file node), whether or not those
     * nodes are ever walked. Serves as the denominator for the share of fetched
     * nodes that end up materialized (`nodesMaterialized / nodesFetched`).
     */
    nodesFetched: number;
}
/** A point-in-time snapshot of collected timing information. */
export interface TimingInfo {
    /** Whether timing collection is enabled for this API instance. */
    enabled: boolean;
    /** Running totals across every measured request. */
    totals: TimingAccumulators;
    /**
     * The most recent requests, up to {@link RECENT_REQUEST_CAPACITY}, ordered
     * from oldest to newest.
     */
    recentRequests: RequestTiming[];
}
/** A raw measurement handed to {@link TimingCollector.record}. */
export interface TimingSample {
    method: string;
    roundTripMs: number;
    bytesSent: number;
    bytesReceived: number;
}
/**
 * A single server-side request's processing-time sample, as returned by a
 * `getServerTiming` request. This is an internal wire shape; consumers see the
 * folded-in {@link RequestTiming.serverTimeMs}.
 */
export interface ServerRequestTiming {
    /** The API method that was handled. */
    method: string;
    /** Server-side processing time, in milliseconds. */
    processingTimeMs: number;
    /** Unix timestamp in milliseconds captured when the request completed. */
    timestamp: number;
}
/** Running totals accumulated on the server across every handled request. */
export interface ServerTimingTotals {
    /** Total number of requests handled. */
    requestCount: number;
    /** Sum of server-side processing time, in milliseconds. */
    totalProcessingTimeMs: number;
}
/**
 * A snapshot of the server's own timing collection, retrieved via a
 * `getServerTiming` request. This is an internal wire shape used to compute the
 * server-derived fields of {@link TimingInfo}.
 */
export interface ServerTimingInfo {
    /** Whether server-side timing collection is enabled. */
    enabled: boolean;
    /** Running totals across every request the server handled. */
    totals: ServerTimingTotals;
    /**
     * The most recent requests as seen by the server, ordered from oldest to
     * newest.
     */
    recentRequests: ServerRequestTiming[];
}
/** Returns a snapshot representing a disabled (never-collecting) timing state. */
export declare function disabledTimingInfo(): TimingInfo;
/** Returns a snapshot representing disabled server-side timing collection. */
export declare function disabledServerTimingInfo(): ServerTimingInfo;
/**
 * Folds a server-side timing snapshot into a client-side snapshot, producing a
 * combined {@link TimingInfo} with per-request and total server processing time
 * plus estimated transport overhead.
 *
 * Recent requests are paired newest-to-newest and only matched when the method
 * names agree, so that requests recorded by only one side (e.g. the meta
 * requests used to fetch timing) do not misalign the two ring buffers.
 */
export declare function combineTimingInfo(client: TimingInfo, server: ServerTimingInfo): TimingInfo;
/**
 * Accumulates request timing samples into running totals and a fixed-size ring
 * buffer of the most recent requests.
 */
export declare class TimingCollector {
    private totals;
    private ring;
    private head;
    /** Records a single request's measurements. */
    record(sample: TimingSample): void;
    /**
     * Records a single AST node materialization. Called on demand as the consumer
     * walks a binary source-file response's tree, so it is not tied to any one
     * request.
     */
    recordMaterialization(): void;
    /**
     * Records a fetched source file: increments the fetched-file counter and adds
     * the file's materializable node count to the fetched-node total, which serves
     * as the denominator for the share of fetched nodes that end up materialized.
     */
    recordSourceFileFetched(materializableNodeCount: number): void;
    /** Returns a snapshot of the collected timing information. */
    getInfo(): TimingInfo;
    /** Clears all accumulated totals and recent-request history. */
    reset(): void;
}
//# sourceMappingURL=timing.d.ts.map