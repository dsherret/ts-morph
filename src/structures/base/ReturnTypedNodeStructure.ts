import { CodeBlockWriter } from "../../codeBlockWriter";

export interface ReturnTypedNodeStructure {
    returnType?: string | ((writer: CodeBlockWriter) => void);
}
