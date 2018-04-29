import { CodeBlockWriter } from "../../codeBlockWriter";

export interface InitializerSetExpressionableNodeStructure {
    initializer?: string | ((writer: CodeBlockWriter) => void);
}
