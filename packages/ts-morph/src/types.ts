import { CodeBlockWriter } from "./codeBlockWriter";

export type Constructor<T> = new(...args: any[]) => T;
export type WriterFunction = (writer: CodeBlockWriter) => void;
