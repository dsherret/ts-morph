import { CodeBlockWriter } from "../../codeBlockWriter";

export interface JSDocStructure {
    description: string | ((writer: CodeBlockWriter) => void);
}
