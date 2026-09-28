type DecodeInput = ArrayBufferView | ArrayBufferLike | null;
interface DecodeOptions {
    stream?: boolean | undefined;
}
export declare function encodeWtf8(text: string): Uint8Array;
export declare class Wtf8Decoder extends TextDecoder {
    decode(input?: DecodeInput, options?: DecodeOptions): string;
}
export {};
