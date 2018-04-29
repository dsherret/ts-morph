import { CodeBlockWriter } from "../../codeBlockWriter";

export interface BodiedNodeStructure {
    bodyText?: string | ((writer: CodeBlockWriter) => void);
}
