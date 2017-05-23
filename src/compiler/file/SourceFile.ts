import * as ts from "typescript";
import * as errors from "./../../errors";
import {removeNodes} from "./../../manipulation";
import {ArrayUtils, FileUtils} from "./../../utils";
import {Node, Symbol} from "./../common";
import {StatementedNode} from "./../statement";
import {Diagnostic} from "./../tools";

export const SourceFileBase = StatementedNode(Node);
export class SourceFile extends SourceFileBase<ts.SourceFile> {
    /**
     * Gets the file path.
     */
    getFilePath() {
        return this.node.fileName;
    }

    /**
     * Copy this source file to a new file.
     * @param filePath - A new file path. Can be relative to the original file or an absolute path.
     */
    copy(filePath: string): SourceFile {
        const absoluteFilePath = FileUtils.getAbsoluteOrRelativePathFromPath(filePath, FileUtils.getDirName(this.getFilePath()));
        return this.factory.addSourceFileFromText(absoluteFilePath, this.getFullText());
    }

    /**
     * Asynchronously saves this file with any changes.
     */
    save(callback?: (err: NodeJS.ErrnoException) => void) {
        // todo: use a promise
        this.factory.getFileSystemHost().writeFile(this.getFilePath(), this.getFullText(), callback);
    }

    /**
     * Synchronously saves this file with any changes.
     */
    saveSync() {
        this.factory.getFileSystemHost().writeFileSync(this.getFilePath(), this.getFullText());
    }

    /**
     * Gets any referenced files.
     */
    getReferencedFiles() {
        const dirName = FileUtils.getDirName(this.getFilePath());
        return (this.node.referencedFiles || []).map(f => this.factory.getSourceFileFromFilePath(FileUtils.pathJoin(dirName, f.fileName)));
    }

    /**
     * Gets if this is a declaration file.
     */
    isDeclarationFile() {
        return this.node.isDeclarationFile;
    }

    /**
     * Gets the default export symbol of the file.
     */
    getDefaultExportSymbol(): Symbol | undefined {
        const sourceFileSymbol = this.getRequiredSourceFile().getSymbol();

        // will be undefined when the source file doesn't have an export
        if (sourceFileSymbol == null)
            return undefined;

        return sourceFileSymbol.getExportByName("default");
    }

    /**
     * Gets the compiler diagnostics.
     * @param program - Optional program.
     */
    getDiagnostics(): Diagnostic[] {
        // todo: implement cancellation token
        const compilerDiagnostics = ts.getPreEmitDiagnostics(this.factory.getLanguageService().getProgram().getCompilerProgram(), this.getCompilerNode());
        return compilerDiagnostics.map(d => this.factory.getDiagnostic(d));
    }

    /**
     * Removes any "export default";
     */
    removeDefaultExport(defaultExportSymbol?: Symbol | undefined): this {
        defaultExportSymbol = defaultExportSymbol || this.getDefaultExportSymbol();

        if (defaultExportSymbol == null)
            return this;

        const declaration = defaultExportSymbol.getDeclarations()[0];
        if (declaration.node.kind === ts.SyntaxKind.ExportAssignment)
            removeNodes(this, [declaration]);
        else if (declaration.isModifierableNode()) {
            const exportKeyword = declaration.getFirstModifierByKind(ts.SyntaxKind.ExportKeyword);
            const defaultKeyword = declaration.getFirstModifierByKind(ts.SyntaxKind.DefaultKeyword);
            removeNodes(this, [exportKeyword, defaultKeyword]);
        }

        return this;
    }
}
