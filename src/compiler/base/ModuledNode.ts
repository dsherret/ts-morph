import * as errors from "../../errors";
import { FormattingKind, removeChildrenWithFormatting } from "../../manipulation";
import { ModuledNodeStructure, ImportDeclarationStructure, ExportDeclarationStructure, ExportAssignmentStructure } from "../../structures";
import { Constructor } from "../../types";
import { ts, SyntaxKind } from "../../typescript";
import { ArrayUtils, TypeGuards, createHashSet } from "../../utils";
import { callBaseSet } from "../callBaseSet";
import { Node, Symbol } from "../common";
import { ImportDeclaration, ExportDeclaration, ExportAssignment, ExportSpecifier } from "../file";
import { StatementedNode } from "../statement";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type ModuledNodeExtensionType = Node<ts.SourceFile | ts.NamespaceDeclaration> & StatementedNode;

export interface ModuledNode {
    /**
     * Adds an import.
     * @param structure - Structure that represents the import.
     */
    addImportDeclaration(structure: ImportDeclarationStructure): ImportDeclaration;
    /**
     * Adds imports.
     * @param structures - Structures that represent the imports.
     */
    addImportDeclarations(structures: ReadonlyArray<ImportDeclarationStructure>): ImportDeclaration[];
    /**
     * Insert an import.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the import.
     */
    insertImportDeclaration(index: number, structure: ImportDeclarationStructure): ImportDeclaration;
    /**
     * Inserts imports.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the imports to insert.
     */
    insertImportDeclarations(index: number, structures: ReadonlyArray<ImportDeclarationStructure>): ImportDeclaration[];
    /**
     * Gets the first import declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the import declaration by.
     */
    getImportDeclaration(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration | undefined;
    /**
     * Gets the first import declaration that matches a module specifier, or undefined if it doesn't exist.
     * @param module - Module specifier to get the import declaration by.
     */
    getImportDeclaration(moduleSpecifier: string): ImportDeclaration | undefined;
    /** @internal */
    getImportDeclaration(conditionOrModuleSpecifier: string | ((importDeclaration: ImportDeclaration) => boolean)): ImportDeclaration | undefined;
    /**
     * Gets the first import declaration that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the import declaration by.
     */
    getImportDeclarationOrThrow(condition: (importDeclaration: ImportDeclaration) => boolean): ImportDeclaration;
    /**
     * Gets the first import declaration that matches a module specifier, or throws if it doesn't exist.
     * @param module - Module specifier to get the import declaration by.
     */
    getImportDeclarationOrThrow(moduleSpecifier: string): ImportDeclaration;
    /** @internal */
    getImportDeclarationOrThrow(conditionOrModuleSpecifier: string | ((importDeclaration: ImportDeclaration) => boolean)): ImportDeclaration;
    /**
     * Get the module's import declarations.
     */
    getImportDeclarations(): ImportDeclaration[];
    /**
     * Add export declarations.
     * @param structure - Structure that represents the export.
     */
    addExportDeclaration(structure: ExportDeclarationStructure): ExportDeclaration;
    /**
     * Add export declarations.
     * @param structures - Structures that represent the exports.
     */
    addExportDeclarations(structures: ReadonlyArray<ExportDeclarationStructure>): ExportDeclaration[];
    /**
     * Insert an export declaration.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExportDeclaration(index: number, structure: ExportDeclarationStructure): ExportDeclaration;
    /**
     * Insert export declarations.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExportDeclarations(index: number, structures: ReadonlyArray<ExportDeclarationStructure>): ExportDeclaration[];
    /*
     * Gets the first export declaration that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the export declaration by.
     */
    getExportDeclaration(condition: (exportDeclaration: ExportDeclaration) => boolean): ExportDeclaration | undefined;
    /**
     * Gets the first export declaration that matches a module specifier, or undefined if it doesn't exist.
     * @param module - Module specifier to get the export declaration by.
     */
    getExportDeclaration(moduleSpecifier: string): ExportDeclaration | undefined;
    /** @internal */
    getExportDeclaration(conditionOrModuleSpecifier: string | ((exportDeclaration: ExportDeclaration) => boolean)): ExportDeclaration | undefined;
    /**
     * Gets the first export declaration that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the export declaration by.
     */
    getExportDeclarationOrThrow(condition: (exportDeclaration: ExportDeclaration) => boolean): ExportDeclaration;
    /**
     * Gets the first export declaration that matches a module specifier, or throws if it doesn't exist.
     * @param module - Module specifier to get the export declaration by.
     */
    getExportDeclarationOrThrow(moduleSpecifier: string): ExportDeclaration;
    /** @internal */
    getExportDeclarationOrThrow(conditionOrModuleSpecifier: string | ((exportDeclaration: ExportDeclaration) => boolean)): ExportDeclaration;
    /**
     * Get the export declarations.
     */
    getExportDeclarations(): ExportDeclaration[];
    /**
     * Add export assignments.
     * @param structure - Structure that represents the export.
     */
    addExportAssignment(structure: ExportAssignmentStructure): ExportAssignment;
    /**
     * Add export assignments.
     * @param structures - Structures that represent the exports.
     */
    addExportAssignments(structures: ReadonlyArray<ExportAssignmentStructure>): ExportAssignment[];
    /**
     * Insert an export assignment.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExportAssignment(index: number, structure: ExportAssignmentStructure): ExportAssignment;
    /**
     * Insert export assignments into a file.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExportAssignments(index: number, structures: ReadonlyArray<ExportAssignmentStructure>): ExportAssignment[];
    /**
     * Gets the first export assignment that matches a condition, or undefined if it doesn't exist.
     * @param condition - Condition to get the export assignment by.
     */
    getExportAssignment(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment | undefined;
    /**
     * Gets the first export assignment that matches a condition, or throws if it doesn't exist.
     * @param condition - Condition to get the export assignment by.
     */
    getExportAssignmentOrThrow(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment;
    /**
     * Get the file's export assignments.
     */
    getExportAssignments(): ExportAssignment[];
    /**
     * Gets the default export symbol.
     */
    getDefaultExportSymbol(): Symbol | undefined;
    /**
     * Gets the default export symbol or throws if it doesn't exist.
     */
    getDefaultExportSymbolOrThrow(): Symbol;
    /**
     * Gets the export symbols.
     */
    getExportSymbols(): Symbol[];
    /**
     * Gets all the declarations that are exported from the module.
     *
     * This will include declarations that are transitively exported from other modules. If you mean to get the export
     * declarations then use `.getExportDeclarations()`.
     */
    getExportedDeclarations(): Node[];
    /**
     * Removes any "export default".
     */
    removeDefaultExport(defaultExportSymbol?: Symbol | undefined): this;
}

export function ModuledNode<T extends Constructor<ModuledNodeExtensionType>>(Base: T): Constructor<ModuledNode> & T {
    return class extends Base implements ModuledNode {
        addImportDeclaration(structure: ImportDeclarationStructure) {
            return this.addImportDeclarations([structure])[0];
        }

        addImportDeclarations(structures: ReadonlyArray<ImportDeclarationStructure>) {
            const imports = this.getImportDeclarations();
            const insertIndex = imports.length === 0 ? 0 : imports[imports.length - 1].getChildIndex() + 1;
            return this.insertImportDeclarations(insertIndex, structures);
        }

        insertImportDeclaration(index: number, structure: ImportDeclarationStructure) {
            return this.insertImportDeclarations(index, [structure])[0];
        }

        insertImportDeclarations(index: number, structures: ReadonlyArray<ImportDeclarationStructure>): ImportDeclaration[] {
            return this._insertChildren<ImportDeclaration, ImportDeclarationStructure>({
                expectedKind: SyntaxKind.ImportDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this.context.structurePrinterFactory.forImportDeclaration().printTexts(writer, structures);
                    }, {
                        previousNewLine: previousMember => TypeGuards.isImportDeclaration(previousMember),
                        nextNewLine: nextMember => TypeGuards.isImportDeclaration(nextMember)
                    });
                }
            });
        }

        getImportDeclaration(conditionOrModuleSpecifier: string | ((importDeclaration: ImportDeclaration) => boolean)) {
            return ArrayUtils.find(this.getImportDeclarations(), getCondition());

            function getCondition() {
                if (typeof conditionOrModuleSpecifier === "string")
                    return (dec: ImportDeclaration) => dec.getModuleSpecifierValue() === conditionOrModuleSpecifier;
                else
                    return conditionOrModuleSpecifier;
            }
        }

        getImportDeclarationOrThrow(conditionOrModuleSpecifier: string | ((importDeclaration: ImportDeclaration) => boolean)) {
            return errors.throwIfNullOrUndefined(this.getImportDeclaration(conditionOrModuleSpecifier), "Expected to find an import with the provided condition.");
        }

        getImportDeclarations(): ImportDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.ImportDeclaration);
        }

        addExportDeclaration(structure: ExportDeclarationStructure) {
            return this.addExportDeclarations([structure])[0];
        }

        addExportDeclarations(structures: ReadonlyArray<ExportDeclarationStructure>) {
            // always insert at end of module because of export {Identifier}; statements
            return this.insertExportDeclarations(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertExportDeclaration(index: number, structure: ExportDeclarationStructure) {
            return this.insertExportDeclarations(index, [structure])[0];
        }

        insertExportDeclarations(index: number, structures: ReadonlyArray<ExportDeclarationStructure>): ExportDeclaration[] {
            return this._insertChildren<ExportDeclaration, ExportDeclarationStructure>({
                expectedKind: SyntaxKind.ExportDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this.context.structurePrinterFactory.forExportDeclaration().printTexts(writer, structures);
                    }, {
                            previousNewLine: previousMember => TypeGuards.isExportDeclaration(previousMember),
                            nextNewLine: nextMember => TypeGuards.isExportDeclaration(nextMember)
                        });
                }
            });
        }

        getExportDeclaration(conditionOrModuleSpecifier: string | ((exportDeclaration: ExportDeclaration) => boolean)) {
            return ArrayUtils.find(this.getExportDeclarations(), getCondition());

            function getCondition() {
                if (typeof conditionOrModuleSpecifier === "string")
                    return (dec: ExportDeclaration) => dec.getModuleSpecifierValue() === conditionOrModuleSpecifier;
                else
                    return conditionOrModuleSpecifier;
            }
        }

        getExportDeclarationOrThrow(conditionOrModuleSpecifier: string | ((exportDeclaration: ExportDeclaration) => boolean)) {
            return errors.throwIfNullOrUndefined(this.getExportDeclaration(conditionOrModuleSpecifier), "Expected to find an export declaration with the provided condition.");
        }

        getExportDeclarations(): ExportDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.ExportDeclaration);
        }

        addExportAssignment(structure: ExportAssignmentStructure) {
            return this.addExportAssignments([structure])[0];
        }

        addExportAssignments(structures: ReadonlyArray<ExportAssignmentStructure>) {
            // always insert at end of file because of export {Identifier}; statements
            return this.insertExportAssignments(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertExportAssignment(index: number, structure: ExportAssignmentStructure) {
            return this.insertExportAssignments(index, [structure])[0];
        }

        insertExportAssignments(index: number, structures: ReadonlyArray<ExportAssignmentStructure>): ExportAssignment[] {
            return this._insertChildren<ExportAssignment, ExportAssignmentStructure>({
                expectedKind: SyntaxKind.ExportAssignment,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this.context.structurePrinterFactory.forExportAssignment().printTexts(writer, structures);
                    }, {
                            previousNewLine: previousMember => TypeGuards.isExportAssignment(previousMember),
                            nextNewLine: nextMember => TypeGuards.isExportAssignment(nextMember)
                        });
                }
            });
        }

        getExportAssignment(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment | undefined {
            return ArrayUtils.find(this.getExportAssignments(), condition);
        }

        getExportAssignmentOrThrow(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment {
            return errors.throwIfNullOrUndefined(this.getExportAssignment(condition), "Expected to find an export assignment with the provided condition.");
        }

        getExportAssignments(): ExportAssignment[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.ExportAssignment);
        }

        getDefaultExportSymbol(): Symbol | undefined {
            const sourceFileSymbol = this.getSymbol();

            // will be undefined when the module doesn't have an export
            if (sourceFileSymbol == null)
                return undefined;

            return sourceFileSymbol.getExportByName("default");
        }

        getDefaultExportSymbolOrThrow(): Symbol {
            return errors.throwIfNullOrUndefined(this.getDefaultExportSymbol(), "Expected to find a default export symbol");
        }

        getExportSymbols(): Symbol[] {
            const symbol = this.getSymbol();
            return symbol == null ? [] : this.context.typeChecker.getExportsOfModule(symbol);
        }

        getExportedDeclarations(): Node[] {
            const exportSymbols = this.getExportSymbols();
            return ArrayUtils.from(getDeclarationsForSymbols());

            function* getDeclarationsForSymbols() {
                const handledDeclarations = createHashSet<Node>();

                for (const symbol of exportSymbols)
                    for (const declaration of symbol.getDeclarations())
                        yield* getDeclarationHandlingExportSpecifiers(declaration);

                function* getDeclarationHandlingExportSpecifiers(declaration: Node): IterableIterator<Node> {
                    if (handledDeclarations.has(declaration))
                        return;
                    handledDeclarations.add(declaration);

                    if (declaration.getKind() === SyntaxKind.ExportSpecifier) {
                        for (const d of (declaration as ExportSpecifier).getLocalTargetDeclarations())
                            yield* getDeclarationHandlingExportSpecifiers(d);
                    }
                    else if (declaration.getKind() === SyntaxKind.ExportAssignment) {
                        const identifier = (declaration as ExportAssignment).getExpression();
                        if (identifier == null || identifier.getKind() !== SyntaxKind.Identifier)
                            return;
                        const symbol = identifier.getSymbol();
                        if (symbol == null)
                            return;
                        for (const d of symbol.getDeclarations())
                            yield* getDeclarationHandlingExportSpecifiers(d);
                    }
                    else
                        yield declaration;
                }
            }
        }

        removeDefaultExport(defaultExportSymbol?: Symbol | undefined): this {
            defaultExportSymbol = defaultExportSymbol || this.getDefaultExportSymbol();

            if (defaultExportSymbol == null)
                return this;

            const declaration = defaultExportSymbol.getDeclarations()[0];
            if (declaration.compilerNode.kind === SyntaxKind.ExportAssignment)
                removeChildrenWithFormatting({ children: [declaration], getSiblingFormatting: () => FormattingKind.Newline });
            else if (TypeGuards.isModifierableNode(declaration)) {
                declaration.toggleModifier("default", false);
                declaration.toggleModifier("export", false);
            }

            return this;
        }

        set(structure: Partial<ModuledNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.imports != null) {
                this.getImportDeclarations().forEach(d => d.remove());
                this.addImportDeclarations(structure.imports);
            }
            if (structure.exports != null) {
                this.getExportDeclarations().forEach(d => d.remove());
                this.addExportDeclarations(structure.exports);
            }

            return this;
        }

        getStructure() {
            // do not get the imports and exports... instead let StatementedNode return the body text
            return callBaseGetStructure<{}>(Base.prototype, this, {});
        }
    };
}
