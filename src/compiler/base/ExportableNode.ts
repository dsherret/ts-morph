import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {TypeChecker} from "./../tools";
import {SourceFile} from "./../file";
import {ModifierableNode} from "./ModifierableNode";

export type ExportableNodeExtensionType = Node & ModifierableNode;

export interface ExportableNode {
    hasExportKeyword(): boolean;
    getExportKeyword(): Node | undefined;
    hasDefaultKeyword(): boolean;
    getDefaultKeyword(): Node | undefined;
    isDefaultExport(): boolean;
    isNamedExport(): boolean;
    setIsDefaultExport(value: boolean, sourceFile?: SourceFile, typeChecker?: TypeChecker): this;
    setIsExported(value: boolean, sourceFile?: SourceFile, typeChecker?: TypeChecker): this;
}

export function ExportableNode<T extends Constructor<ExportableNodeExtensionType>>(Base: T): Constructor<ExportableNode> & T {
    return class extends Base implements ExportableNode {
        /**
         * If the node has the export keyword.
         */
        hasExportKeyword() {
            return this.getExportKeyword() != null;
        }

        /**
         * Gets the export keyword or undefined if none exists.
         */
        getExportKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.ExportKeyword);
        }

        /**
         * If the node has the default keyword.
         */
        hasDefaultKeyword() {
            return this.getDefaultKeyword() != null;
        }

        /**
         * Gets the default keyword or undefined if none exists.
         */
        getDefaultKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.DefaultKeyword);
        }

        /**
         * Gets if this node is a default export.
         * @param typeChecker - Optional type checker.
         */
        isDefaultExport(typeChecker?: TypeChecker) {
            if (this.hasDefaultKeyword())
                return true;

            typeChecker = typeChecker || this.factory.getLanguageService().getProgram().getTypeChecker();
            const thisSymbol = this.getSymbol(typeChecker);
            const defaultExportSymbol = this.getRequiredSourceFile().getDefaultExportSymbol(typeChecker);

            if (defaultExportSymbol == null || thisSymbol == null)
                return false;

            if (thisSymbol.equals(defaultExportSymbol))
                return true;

            const aliasedSymbol = defaultExportSymbol.getAliasedSymbol(typeChecker);
            return thisSymbol.equals(aliasedSymbol);
        }

        /**
         * Gets if this node is a named export.
         */
        isNamedExport() {
            const parentNode = this.getRequiredParent();
            return parentNode.isSourceFile() && this.hasExportKeyword() && !this.hasDefaultKeyword();
        }

        /**
         * Sets if this node is a default export.
         * @param value - If it should be a default export or not.
         * @param sourceFile - Optional source file to help with performance.
         * @param typeChecker - Optional type checker.
         */
        setIsDefaultExport(value: boolean, sourceFile?: SourceFile, typeChecker: TypeChecker = this.factory.getTypeChecker()) {
            if (value === this.isDefaultExport(typeChecker))
                return this;

            if (value && !this.getRequiredParent().isSourceFile())
                throw new errors.InvalidOperationError("The parent must be a source file in order to set this node as a default export.");

            // remove any existing default export
            sourceFile = sourceFile || this.getRequiredSourceFile();
            const fileDefaultExportSymbol = sourceFile.getDefaultExportSymbol(typeChecker);

            if (fileDefaultExportSymbol != null)
                sourceFile.removeDefaultExport(typeChecker, fileDefaultExportSymbol);

            // set this node as the one to default export
            if (value) {
                this.addModifier("export", sourceFile);
                this.addModifier("default", sourceFile);
            }

            return this;
        }

        /**
         * Sets if the node is exported.
         * Note: Will always remove the default export if set.
         * @param value - If it should be exported or not.
         * @param sourceFile - Optional source file to help with performance.
         * @param typeChecker - Optional type checker.
         */
        setIsExported(value: boolean, sourceFile?: SourceFile, typeChecker?: TypeChecker) {
            // remove the default export if it is one no matter what
            if (this.getRequiredParent().isSourceFile()) {
                typeChecker = typeChecker || this.factory.getTypeChecker();
                this.setIsDefaultExport(false, sourceFile, typeChecker);
            }

            if (value) {
                if (!this.hasExportKeyword())
                    this.addModifier("export", sourceFile);
            }
            else {
                const exportKeyword = this.getExportKeyword();
                if (exportKeyword != null)
                    (sourceFile || this.getRequiredSourceFile()).removeNodes(exportKeyword);
            }

            return this;
        }
    };
}
