import { CodeBlockWriter } from "../../codeBlockWriter";

export interface TypedNodeStructure {
    type?: string | ((writer: CodeBlockWriter) => void);
}
