import CodeBlockWriter from "code-block-writer";

export interface BodiedNodeStructure {
    bodyText?: string | ((writer: CodeBlockWriter) => void);
}
