/**
 * Pure JS replacement for @typescript/libsyncrpc.
 *
 * Spawns a child process and communicates with it synchronously over
 * stdin/stdout pipes using the same MessagePack-based tuple protocol:
 *   [MessageType (u8), method (bin), payload (bin)]
 *
 * Synchronous I/O is achieved by calling fs.readSync / fs.writeSync
 * directly on the pipe file descriptors obtained from the spawned
 * ChildProcess.
 */
/**
 * SyncRpcChannel – drop-in replacement for the native libsyncrpc class.
 *
 * API surface intentionally matches the original:
 *   - constructor(exe, args)
 *   - requestSync(method, payload): string
 *   - requestBinarySync(method, payload): Uint8Array
 *   - registerCallback(name, cb)
 *   - close()
 *
 * The protocol is unversioned; both sides (this JS channel and the Go
 * child process) must be built from the same tree.
 *
 * This class is **not** thread-safe. All calls must originate from a
 * single thread — do not share an instance across worker threads.
 */
export declare class SyncRpcChannel {
    private child;
    private readFd;
    private writeFd;
    private pipeFd;
    private callbacks;
    private methodBufCache;
    private readonly collectTiming;
    lastBytesSent: number;
    lastBytesReceived: number;
    private _msgType;
    private _msgName;
    private _msgPayload;
    private headerBuf;
    private readBuf;
    private readBufPos;
    private readBufLen;
    private writeBuf;
    constructor(exe: string, args: string[], collectTiming?: boolean);
    /**
     * Send a request and synchronously wait for the response (string).
     * Handles Call (callback) messages from the child inline.
     */
    requestSync(method: string, payload: string): string;
    /**
     * Send a request and synchronously wait for the response (binary).
     * Handles Call (callback) messages from the child inline.
     */
    requestBinarySync(method: string, payload: Uint8Array): Uint8Array;
    /** Register a string→string callback that the child may invoke. */
    registerCallback(name: string, callback: (name: string, payload: string) => string): void;
    /** Kill the child process and release resources. */
    close(): void;
    private ensureOpen;
    private getMethodBuf;
    private requestBytesSync;
    /**
     * Handle an incoming MSG_CALL from the child process.
     *
     * After sending the error response back to the child, this method
     * intentionally re-throws to abort the caller's request loop.
     * A failed callback is treated as unrecoverable to match the
     * behavior of the native libsyncrpc addon.
     */
    private handleCall;
    /**
     * Write a complete [type, name, payload] tuple in as few writeSync
     * calls as possible.  For messages that fit in the pre-allocated
     * write buffer (64 KB), everything is assembled and sent in a single
     * syscall.  Larger messages use two syscalls: one for the header
     * portion and one for the payload data.
     */
    private writeTuple;
    /**
     * Read a [type, name, payload] tuple into instance fields
     * (_msgType, _msgName, _msgPayload) to avoid allocating a
     * short-lived 3-element array on every call.
     */
    private readTuple;
    /**
     * Read a MessagePack bin field.
     */
    private readBin;
    /** Build an EOF error with the child's exit code/signal if available. */
    private eofError;
    /** Read a single byte from the buffered read-ahead. */
    private readByte;
    private readExact;
    /**
     * Fill the internal read-ahead buffer from the pipe fd.
     * Retries on EAGAIN for non-blocking mode compatibility.
     */
    private fillReadBuffer;
    /**
     * Synchronously read exactly `length` bytes into `buffer`.
     * Serves from the internal read-ahead buffer first; for large reads
     * that exceed the buffer size, reads directly from the fd to avoid
     * an extra copy.
     */
    private readExactInto;
    /**
     * Synchronously write all bytes from `data` (up to `length`).
     * Retries on EAGAIN.
     */
    private writeAllBuf;
}
//# sourceMappingURL=syncChannel.d.ts.map