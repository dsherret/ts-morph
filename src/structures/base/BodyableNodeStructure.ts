import { CodeBlockWriter } from "../../codeBlockWriter";

export interface BodyableNodeStructure {
    bodyText?: string | ((writer: CodeBlockWriter) => void);
}
