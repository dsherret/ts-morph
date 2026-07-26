export declare const MSGPACK_FIXARRAY3 = 147;
export declare const MSGPACK_BIN8 = 196;
export declare const MSGPACK_BIN16 = 197;
export declare const MSGPACK_BIN32 = 198;
export declare const MSGPACK_UINT8 = 204;
/** Compute the MessagePack bin header size for a given data length. */
export declare function binHeaderSize(len: number): number;
/** Write a MessagePack bin header into `buf` at `off`, return new offset. */
export declare function writeBinHeader(buf: Uint8Array, off: number, len: number): number;
export declare class MsgpackWriter {
    private buf;
    private view;
    private pos;
    constructor(initialSize?: number);
    private ensure;
    writeArrayHeader(length: number): void;
    writeUint(value: number): void;
    writeString(str: string): void;
    writeBool(value: boolean): void;
    finish(): Uint8Array;
}
export declare class MsgpackReader {
    private buf;
    private view;
    private pos;
    constructor(data: Uint8Array, offset?: number);
    readArrayHeader(): number;
    readUint(): number;
    readString(): string;
    readBool(): boolean;
}
//# sourceMappingURL=msgpack.d.ts.map