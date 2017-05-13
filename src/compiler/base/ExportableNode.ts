import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {TypeChecker} from "./../tools";
import {SourceFile} from "./../file";
import {ModifierableNode} from "./ModifierableNode";

export type ExportableNodeExtensionType = Node & ModifierableNode;

export interface ExportableNode {
    /**
     * If the node has the export keyword.
     */
    hasExportKeyword(): boolean;
    /**
     * Gets the export keyword or undefined if none exists.
     */
    getExportKeyword(): Node | undefined;
    /**
     * If the node has the default keyword.
     */
    hasDefaultKeyword(): boolean;
    /**
     * Gets the default keyword or undefined if none exists.
     */
    getDefaultKeyword(): Node | undefined;
    /**
     * Gets if this node is a default export.
     */
    isDefaultExport(): boolean;
    /**
     * Gets if this node is a named export.
     */
    isNamedExport(): boolean;
    /**
     * Sets if this node is a default export.
     * @param value - If it should be a default export or not.
     * @param sourceFile - Optional source file to help with performance.
     */
    setIsDefaultExport(value: boolean, sourceFile?: SourceFile): this;
    /**
     * Sets if the node is exported.
     * Note: Will always remove the default export if set.
     * @param value - If it should be exported or not.
     * @param sourceFile - Optional source file to help with performance.
     */
    setIsExported(value: boolean, sourceFile?: SourceFile): this;
}

export function ExportableNode<T extends Constructor<ExportableNodeExtensionType>>(Base: T): Constructor<ExportableNode> & T {
    return class extends Base implements ExportableNode {
        hasExportKeyword() {
            return this.getExportKeyword() != null;
        }

        getExportKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.ExportKeyword);
        }

        hasDefaultKeyword() {
            return this.getDefaultKeyword() != null;
        }

        getDefaultKeyword() {
            return this.getFirstModifierByKind(ts.SyntaxKind.DefaultKeyword);
        }

        isDefaultExport() {
            if (this.hasDefaultKeyword())
                return true;

            const thisSymbol = this.getSymbol();
            const defaultExportSymbol = this.getRequiredSourceFile().getDefaultExportSymbol();

            if (defaultExportSymbol == null || thisSymbol == null)
                return false;

            if (thisSymbol.equals(defaultExportSymbol))
                return true;

            const aliasedSymbol = defaultExportSymbol.getAliasedSymbol();
            return thisSymbol.equals(aliasedSymbol);
        }

        isNamedExport() {
            const parentNode = this.getRequiredParent();
            return parentNode.isSourceFile() && this.hasExportKeyword() && !this.hasDefaultKeyword();
        }

        setIsDefaultExport(value: boolean, sourceFile?: SourceFile) {
            if (value === this.isDefaultExport())
                return this;

            if (value && !this.getRequiredParent().isSourceFile())
                throw new errors.InvalidOperationError("The parent must be a source file in order to set this node as a default export.");

            // remove any existing default export
            sourceFile = sourceFile || this.getRequiredSourceFile();
            const fileDefaultExportSymbol = sourceFile.getDefaultExportSymbol();

            if (fileDefaultExportSymbol != null)
                sourceFile.removeDefaultExport(fileDefaultExportSymbol);

            // set this node as the one to default export
            if (value) {
                this.addModifier("export", sourceFile);
                this.addModifier("default", sourceFile);
            }

            return this;
        }

        setIsExported(value: boolean, sourceFile?: SourceFile) {
            // remove the default export if it is one no matter what
            if (this.getRequiredParent().isSourceFile()) {
                this.setIsDefaultExport(false, sourceFile);
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
