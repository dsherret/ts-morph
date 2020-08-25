import { CodeBlockWriter } from "./codeBlockWriter";

export type Constructor<T> = new(...args: any[]) => T;
export type InstanceOf<T> = T extends new(...args: any[]) => infer U ? U : never;
export type WriterFunction = (writer: CodeBlockWriter) => void;
