/**
 * Browser build of {@link SyncRpcChannel}.
 *
 * The real one spawns a child process and blocks on pipe file descriptors, which
 * a browser has neither of. This stand-in exists only so the sync client can be
 * bundled for the browser without dragging node:child_process / node:fs in: it
 * satisfies the same shape but refuses to be constructed. Reaching it means the
 * native backend was selected where it cannot run, which the auto-selecting
 * entry point (see create.ts) is meant to prevent — so the message points there.
 */
import type { RpcChannel } from "./wasmChannel";
export declare class SyncRpcChannel implements RpcChannel {
    lastBytesSent: number;
    lastBytesReceived: number;
    constructor(_exe: string, _args: string[], _collectTiming?: boolean);
    requestSync(_method: string, _payload: string): string;
    requestBinarySync(_method: string, _payload: Uint8Array): Uint8Array;
    registerCallback(_name: string, _callback: (name: string, payload: string) => string): void;
    unregisterCallback(_name: string): void;
    close(): void;
}
