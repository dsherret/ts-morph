import CodeBlockWriter from "code-block-writer";

export interface BodyableNodeStructure {
    bodyText?: string | ((writer: CodeBlockWriter) => void);
}
