import { errors, ArrayUtils, ts, SyntaxKind } from "@ts-morph/common";
import { FormattingKind, removeChildrenWithFormatting } from "../../../manipulation";
import { ImportDeclarationStructure, ExportDeclarationStructure, ExportAssignmentStructure, OptionalKind } from "../../../structures";
import { Constructor } from "../../../types";
import { Symbol } from "../../symbols";
import { isComment } from "../utils";
import { ExportedDeclarations } from "../aliases";
import { Node } from "../common";
import { ImportDeclaration, ExportDeclaration, ExportAssignment } from "../module";
import { StatementedNode } from "../statement";

export type ModuledNodeExtensionType = Node<ts.SourceFile | ts.NamespaceDeclaration> & StatementedNode;

export interface ModuledNode {
    /**
     * Adds an import.
     * @param structure - Structure that represents the import.
     */
    addImportDeclaration(structure: OptionalKind<ImportDeclarationStructure>): ImportDeclaration;
    /**
     * Adds imports.
     * @param structures - Structures that represent the imports.
     */
    addImportDeclarations(structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>): ImportDeclaration[];
    /**
     * Insert an import.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the import.
     */
    insertImportDeclaration(index: number, structure: OptionalKind<ImportDeclarationStructure>): ImportDeclaration;
    /**
     * Inserts imports.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the imports to insert.
     */
    insertImportDeclarations(index: number, structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>): ImportDeclaration[];
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
    addExportDeclaration(structure: OptionalKind<ExportDeclarationStructure>): ExportDeclaration;
    /**
     * Add export declarations.
     * @param structures - Structures that represent the exports.
     */
    addExportDeclarations(structures: ReadonlyArray<OptionalKind<ExportDeclarationStructure>>): ExportDeclaration[];
    /**
     * Insert an export declaration.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExportDeclaration(index: number, structure: OptionalKind<ExportDeclarationStructure>): ExportDeclaration;
    /**
     * Insert export declarations.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExportDeclarations(index: number, structures: ReadonlyArray<OptionalKind<ExportDeclarationStructure>>): ExportDeclaration[];
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
    addExportAssignment(structure: OptionalKind<ExportAssignmentStructure>): ExportAssignment;
    /**
     * Add export assignments.
     * @param structures - Structures that represent the exports.
     */
    addExportAssignments(structures: ReadonlyArray<OptionalKind<ExportAssignmentStructure>>): ExportAssignment[];
    /**
     * Insert an export assignment.
     * @param index - Child index to insert at.
     * @param structure - Structure that represents the export.
     */
    insertExportAssignment(index: number, structure: OptionalKind<ExportAssignmentStructure>): ExportAssignment;
    /**
     * Insert export assignments into a file.
     * @param index - Child index to insert at.
     * @param structures - Structures that represent the exports to insert.
     */
    insertExportAssignments(index: number, structures: ReadonlyArray<OptionalKind<ExportAssignmentStructure>>): ExportAssignment[];
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
     * The key is the name it's exported on and the value is the array of declarations for that name.
     *
     * This will include declarations that are transitively exported from other modules. If you mean to get the export
     * declarations then use `.getExportDeclarations()`.
     */
    getExportedDeclarations(): ReadonlyMap<string, ExportedDeclarations[]>;
    /**
     * Removes any "export default".
     */
    removeDefaultExport(defaultExportSymbol?: Symbol | undefined): this;
}

export function ModuledNode<T extends Constructor<ModuledNodeExtensionType>>(Base: T): Constructor<ModuledNode> & T {
    return class extends Base implements ModuledNode {
        addImportDeclaration(structure: OptionalKind<ImportDeclarationStructure>) {
            return this.addImportDeclarations([structure])[0];
        }

        addImportDeclarations(structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>) {
            const compilerChildren = this._getCompilerStatementsWithComments();

            return this.insertImportDeclarations(getInsertIndex(), structures);

            function getInsertIndex() {
                let insertIndex = 0;
                let wasLastComment = true;

                for (let i = 0; i < compilerChildren.length; i++) {
                    const child = compilerChildren[i];
                    // Insert after any multiline comments at the beginning of the file.
                    // A multi-line comment is likely a file header.
                    if (wasLastComment && child.kind === SyntaxKind.MultiLineCommentTrivia)
                        insertIndex = i + 1;
                    else {
                        wasLastComment = false;
                        if (child.kind === SyntaxKind.ImportDeclaration)
                            insertIndex = i + 1;
                    }
                }

                return insertIndex;
            }
        }

        insertImportDeclaration(index: number, structure: OptionalKind<ImportDeclarationStructure>) {
            return this.insertImportDeclarations(index, [structure])[0];
        }

        insertImportDeclarations(index: number, structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>): ImportDeclaration[] {
            return this._insertChildren({
                expectedKind: SyntaxKind.ImportDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this._context.structurePrinterFactory.forImportDeclaration().printTexts(writer, structures);
                    }, {
                        previousNewLine: previousMember => Node.isImportDeclaration(previousMember) || isComment(previousMember.compilerNode),
                        nextNewLine: nextMember => Node.isImportDeclaration(nextMember)
                    });
                }
            });
        }

        getImportDeclaration(conditionOrModuleSpecifier: string | ((importDeclaration: ImportDeclaration) => boolean)) {
            return this.getImportDeclarations().find(getCondition());

            function getCondition() {
                if (typeof conditionOrModuleSpecifier === "string")
                    return (dec: ImportDeclaration) => dec.getModuleSpecifierValue() === conditionOrModuleSpecifier;
                else
                    return conditionOrModuleSpecifier;
            }
        }

        getImportDeclarationOrThrow(conditionOrModuleSpecifier: string | ((importDeclaration: ImportDeclaration) => boolean)) {
            return errors.throwIfNullOrUndefined(
                this.getImportDeclaration(conditionOrModuleSpecifier),
                "Expected to find an import with the provided condition."
            );
        }

        getImportDeclarations(): ImportDeclaration[] {
            return this.getStatements().filter(Node.isImportDeclaration);
        }

        addExportDeclaration(structure: OptionalKind<ExportDeclarationStructure>) {
            return this.addExportDeclarations([structure])[0];
        }

        addExportDeclarations(structures: ReadonlyArray<OptionalKind<ExportDeclarationStructure>>) {
            // always insert at end of module because of export {Identifier}; statements
            return this.insertExportDeclarations(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertExportDeclaration(index: number, structure: OptionalKind<ExportDeclarationStructure>) {
            return this.insertExportDeclarations(index, [structure])[0];
        }

        insertExportDeclarations(index: number, structures: ReadonlyArray<OptionalKind<ExportDeclarationStructure>>): ExportDeclaration[] {
            return this._insertChildren({
                expectedKind: SyntaxKind.ExportDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this._context.structurePrinterFactory.forExportDeclaration().printTexts(writer, structures);
                    }, {
                        previousNewLine: previousMember => Node.isExportDeclaration(previousMember) || isComment(previousMember.compilerNode),
                        nextNewLine: nextMember => Node.isExportDeclaration(nextMember)
                    });
                }
            });
        }

        getExportDeclaration(conditionOrModuleSpecifier: string | ((exportDeclaration: ExportDeclaration) => boolean)) {
            return this.getExportDeclarations().find(getCondition());

            function getCondition() {
                if (typeof conditionOrModuleSpecifier === "string")
                    return (dec: ExportDeclaration) => dec.getModuleSpecifierValue() === conditionOrModuleSpecifier;
                else
                    return conditionOrModuleSpecifier;
            }
        }

        getExportDeclarationOrThrow(conditionOrModuleSpecifier: string | ((exportDeclaration: ExportDeclaration) => boolean)) {
            return errors.throwIfNullOrUndefined(
                this.getExportDeclaration(conditionOrModuleSpecifier),
                "Expected to find an export declaration with the provided condition."
            );
        }

        getExportDeclarations(): ExportDeclaration[] {
            return this.getStatements().filter(Node.isExportDeclaration);
        }

        addExportAssignment(structure: OptionalKind<ExportAssignmentStructure>) {
            return this.addExportAssignments([structure])[0];
        }

        addExportAssignments(structures: ReadonlyArray<OptionalKind<ExportAssignmentStructure>>) {
            // always insert at end of file because of export {Identifier}; statements
            return this.insertExportAssignments(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertExportAssignment(index: number, structure: OptionalKind<ExportAssignmentStructure>) {
            return this.insertExportAssignments(index, [structure])[0];
        }

        insertExportAssignments(index: number, structures: ReadonlyArray<OptionalKind<ExportAssignmentStructure>>): ExportAssignment[] {
            return this._insertChildren({
                expectedKind: SyntaxKind.ExportAssignment,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this._context.structurePrinterFactory.forExportAssignment().printTexts(writer, structures);
                    }, {
                        previousNewLine: previousMember => Node.isExportAssignment(previousMember) || isComment(previousMember.compilerNode),
                        nextNewLine: nextMember => Node.isExportAssignment(nextMember)
                    });
                }
            });
        }

        getExportAssignment(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment | undefined {
            return this.getExportAssignments().find(condition);
        }

        getExportAssignmentOrThrow(condition: (exportAssignment: ExportAssignment) => boolean): ExportAssignment {
            return errors.throwIfNullOrUndefined(this.getExportAssignment(condition), "Expected to find an export assignment with the provided condition.");
        }

        getExportAssignments(): ExportAssignment[] {
            return this.getStatements().filter(Node.isExportAssignment);
        }

        getDefaultExportSymbol(): Symbol | undefined {
            const sourceFileSymbol = this.getSymbol();

            // will be undefined when the module doesn't have an export
            if (sourceFileSymbol == null)
                return undefined;

            return sourceFileSymbol.getExport("default");
        }

        getDefaultExportSymbolOrThrow(): Symbol {
            return errors.throwIfNullOrUndefined(this.getDefaultExportSymbol(), "Expected to find a default export symbol");
        }

        getExportSymbols(): Symbol[] {
            const symbol = this.getSymbol();
            return symbol == null ? [] : this._context.typeChecker.getExportsOfModule(symbol);
        }

        getExportedDeclarations(): ReadonlyMap<string, ExportedDeclarations[]> {
            const result = new Map<string, ExportedDeclarations[]>();
            const exportSymbols = this.getExportSymbols();

            for (const symbol of exportSymbols) {
                for (const declaration of symbol.getDeclarations()) {
                    const declarations = Array.from(getDeclarationHandlingImportsAndExports(declaration)) as ExportedDeclarations[];
                    const name = symbol.getName();
                    const existingArray = result.get(name);
                    if (existingArray != null)
                        existingArray.push(...declarations);
                    else
                        result.set(symbol.getName(), declarations);
                }
            }

            return result;

            function* getDeclarationHandlingImportsAndExports(declaration: Node): IterableIterator<Node> {
                if (Node.isExportSpecifier(declaration)) {
                    for (const d of declaration.getLocalTargetDeclarations())
                        yield* getDeclarationHandlingImportsAndExports(d);
                }
                else if (Node.isExportAssignment(declaration)) {
                    const expression = declaration.getExpression();
                    if (expression == null || expression.getKind() !== SyntaxKind.Identifier) {
                        yield expression;
                        return;
                    }
                    yield* getDeclarationsForSymbol(expression.getSymbol());
                }
                else if (Node.isImportSpecifier(declaration)) {
                    const identifier = declaration.getNameNode();
                    const symbol = identifier.getSymbol();
                    if (symbol == null)
                        return;
                    yield* getDeclarationsForSymbol(symbol.getAliasedSymbol() || symbol);
                }
                else if (Node.isImportClause(declaration)) {
                    const identifier = declaration.getDefaultImport();
                    if (identifier == null)
                        return;
                    const symbol = identifier.getSymbol();
                    if (symbol == null)
                        return;
                    yield* getDeclarationsForSymbol(symbol.getAliasedSymbol() || symbol);
                }
                else if (Node.isNamespaceImport(declaration)) {
                    const symbol = declaration.getNameNode().getSymbol();
                    if (symbol == null)
                        return;
                    yield* getDeclarationsForSymbol(symbol.getAliasedSymbol() || symbol);
                }
                else {
                    yield declaration;
                }

                function* getDeclarationsForSymbol(symbol: Symbol | undefined): IterableIterator<Node> {
                    if (symbol == null)
                        return;
                    for (const d of symbol.getDeclarations())
                        yield* getDeclarationHandlingImportsAndExports(d);
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
            else if (Node.isModifierableNode(declaration)) {
                declaration.toggleModifier("default", false);
                declaration.toggleModifier("export", false);
            }

            return this;
        }
    };
}
