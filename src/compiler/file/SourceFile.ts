import * as ts from "typescript";
import * as errors from "./../../errors";
import {CompilerFactory} from "./../../factories";
import {removeNodes} from "./../../manipulation";
import {ImportDeclarationStructure, ExportDeclarationStructure} from "./../../structures";
import {ArrayUtils, FileUtils} from "./../../utils";
import {Node, Symbol} from "./../common";
import {StatementedNode} from "./../statement";
import {Diagnostic} from "./../tools";
import {ImportDeclaration} from "./ImportDeclaration";
import {ExportDeclaration} from "./ExportDeclaration";

export const SourceFileBase = StatementedNode(Node);
export class SourceFile extends SourceFileBase<ts.SourceFile> {
    /**
     * Initializes a new instance.
     * @internal
     * @param factory - Compiler factory.
     * @param node - Underlying node.
     */
    constructor(
        factory: CompilerFactory,
        node: ts.SourceFile
    ) {
        super(factory, node, undefined as any); // hack :(
        this.sourceFile = this;
    }

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
     * Add an import.
     * @param structure - Structure that represents the import.
     */
    addImport(structure: ImportDeclarationStructure) {
        return this.addImports([structure])[0];
    }

    /**
     * Add imports.
     * @param structures - Structures that represent the imports.
     */
    addImports(structures: ImportDeclarationStructure[]) {
        const imports = this.getImports();
        const insertIndex = imports.length === 0 ? 0 : imports[imports.length - 1].getChildIndex() + 1;
        return this.insertImports(insertIndex, structures);
    }

    /**
     * Insert an import.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the import.
     */
    insertImport(index: number, structure: ImportDeclarationStructure) {
        return this.insertImports(index, [structure])[0];
    }

    /**
     * Insert imports into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the imports to insert.
     */
    insertImports(index: number, structures: ImportDeclarationStructure[]) {
        const newLineChar = this.factory.getLanguageService().getNewLine();
        const indentationText = this.getChildIndentationText();
        const texts = structures.map(structure => {
            const hasNamedImport = structure.namedImports != null && structure.namedImports.length > 0;
            let code = `${indentationText}import`;
            // validation
            if (hasNamedImport && structure.namespaceImport != null)
                throw new errors.InvalidOperationError("An import declaration cannot have both a namespace import and a named import.");
            // default import
            if (structure.defaultImport != null) {
                code += ` ${structure.defaultImport}`;
                if (hasNamedImport || structure.namespaceImport != null)
                    code += ",";
            }
            // namespace import
            if (structure.namespaceImport != null)
                code += ` * as ${structure.namespaceImport}`;
            // named imports
            if (structure.namedImports != null && structure.namedImports.length > 0) {
                const namedImportsCode = structure.namedImports.map(n => {
                    let namedImportCode = n.name;
                    if (n.alias != null)
                        namedImportCode += ` as ${n.alias}`;
                    return namedImportCode;
                }).join(", ");
                code += ` {${namedImportsCode}}`;
            }
            // from keyword
            if (structure.defaultImport != null || hasNamedImport || structure.namespaceImport != null)
                code += " from";
            code += ` "${structure.moduleSpecifier}";`;
            return code;
        });

        return this._insertMainChildren<ImportDeclaration>(index, texts, structures, ts.SyntaxKind.ImportDeclaration, undefined, {
            previousBlanklineWhen: previousMember => !(previousMember instanceof ImportDeclaration),
            nextBlanklineWhen: nextMember => !(nextMember instanceof ImportDeclaration),
            separatorNewlineWhen: () => false
        });
    }

    /**
     * Gets the first import declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the import by.
     */
    getImport(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration | undefined {
        return this.getImports().find(condition);
    }

    /**
     * Get the file's import declarations.
     */
    getImports(): ImportDeclaration[] {
        return this.getChildSyntaxListOrThrow().getChildrenOfKind<ImportDeclaration>(ts.SyntaxKind.ImportDeclaration);
    }

    /**
     * Add an export.
     * @param structure - Structure that represents the export.
     */
    addExport(structure: ExportDeclarationStructure) {
        return this.addExports([structure])[0];
    }

    /**
     * Add exports.
     * @param structures - Structures that represent the exports.
     */
    addExports(structures: ExportDeclarationStructure[]) {
        let insertIndex = 0;
        const exports = this.getExports();
        if (exports.length === 0) {
            const imports = this.getImports();
            insertIndex = imports.length === 0 ? 0 : imports[imports.length - 1].getChildIndex() + 1;
        }
        else {
            insertIndex = exports[exports.length - 1].getChildIndex() + 1;
        }

        return this.insertExports(insertIndex, structures);
    }

    /**
     * Insert an export.
     * @param index - Index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExport(index: number, structure: ExportDeclarationStructure) {
        return this.insertExports(index, [structure])[0];
    }

    /**
     * Insert exports into a file.
     * @param index - Index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExports(index: number, structures: ExportDeclarationStructure[]) {
        const newLineChar = this.factory.getLanguageService().getNewLine();
        const indentationText = this.getChildIndentationText();
        const texts = structures.map(structure => {
            const hasNamedImport = structure.namedExports != null && structure.namedExports.length > 0;
            let code = `${indentationText}export`;
            if (structure.namedExports != null && structure.namedExports.length > 0) {
                const namedExportsCode = structure.namedExports.map(n => {
                    let namedExportCode = n.name;
                    if (n.alias != null)
                        namedExportCode += ` as ${n.alias}`;
                    return namedExportCode;
                }).join(", ");
                code += ` {${namedExportsCode}}`;
            }
            else {
                code += " *";
            }
            code += ` from "${structure.moduleSpecifier}";`;
            return code;
        });

        return this._insertMainChildren<ImportDeclaration>(index, texts, structures, ts.SyntaxKind.ExportDeclaration, undefined, {
            previousBlanklineWhen: previousMember => !(previousMember instanceof ExportDeclaration),
            nextBlanklineWhen: nextMember => !(nextMember instanceof ExportDeclaration),
            separatorNewlineWhen: () => false
        });
    }

    /**
     * Gets the first export declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the export by.
     */
    getExport(condition: (exportDeclaration: ExportDeclaration) => boolean): ExportDeclaration | undefined {
        return this.getExports().find(condition);
    }

    /**
     * Get the file's export declarations.
     */
    getExports(): ExportDeclaration[] {
        return this.getChildSyntaxListOrThrow().getChildrenOfKind<ExportDeclaration>(ts.SyntaxKind.ExportDeclaration);
    }

    /**
     * Gets the default export symbol of the file.
     */
    getDefaultExportSymbol(): Symbol | undefined {
        const sourceFileSymbol = this.getSymbol();

        // will be undefined when the source file doesn't have an export
        if (sourceFileSymbol == null)
            return undefined;

        return sourceFileSymbol.getExportByName("default");
    }

    /**
     * Gets the compiler diagnostics.
     */
    getDiagnostics(): Diagnostic[] {
        // todo: implement cancellation token
        const compilerDiagnostics = ts.getPreEmitDiagnostics(this.factory.getProgram().getCompilerProgram(), this.getCompilerNode());
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
            removeNodes([declaration]);
        else if (declaration.isModifierableNode()) {
            const exportKeyword = declaration.getFirstModifierByKind(ts.SyntaxKind.ExportKeyword);
            const defaultKeyword = declaration.getFirstModifierByKind(ts.SyntaxKind.DefaultKeyword);
            removeNodes([exportKeyword, defaultKeyword]);
        }

        return this;
    }
}
