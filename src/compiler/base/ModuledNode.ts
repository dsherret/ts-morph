import * as errors from "../../errors";
import { ModuledNodeStructure, ImportDeclarationStructure, ExportDeclarationStructure } from "../../structures";
import { Constructor } from "../../types";
import { ts, SyntaxKind } from "../../typescript";
import { ArrayUtils, TypeGuards } from "../../utils";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { ImportDeclaration } from "../file";
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

        set(structure: Partial<ModuledNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.imports != null)
                this.addImportDeclarations(structure.imports);
            //if (structure.exports != null)
            //    this.addExportDeclarations(structure.exports);

            return this;
        }

        getStructure() {
            // do not get the imports and exports... instead let StatementedNode return the body text
            return callBaseGetStructure<{}>(Base.prototype, this, {});
        }
    };
}
