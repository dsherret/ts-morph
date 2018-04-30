import { CodeBlockWriter } from "../../../codeBlockWriter";

export interface SpreadAssignmentStructure {
    expression: string | ((writer: CodeBlockWriter) => void);
}
