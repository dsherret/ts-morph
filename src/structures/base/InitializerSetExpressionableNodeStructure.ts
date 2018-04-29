import CodeBlockWriter from "code-block-writer";

export interface InitializerSetExpressionableNodeStructure {
    initializer?: string | ((writer: CodeBlockWriter) => void);
}
