import CodeBlockWriter from "code-block-writer";

export abstract class StructureToText<TStructure> {
    constructor(protected readonly writer: CodeBlockWriter) {
    }

    abstract writeText(structure: TStructure): void;
}
