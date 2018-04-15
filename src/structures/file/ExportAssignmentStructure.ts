import CodeBlockWriter from "code-block-writer";

export interface ExportAssignmentStructure {
    /** @deprecated - Use isExportEquals. This was incorrectly named. */
    isEqualsExport?: boolean;
    isExportEquals?: boolean;
    expression: string | ((writer: CodeBlockWriter) => void);
}
