import * as ts from "typescript";
import {Node} from "./../common";
import {TypeChecker} from "./../tools";
import {ModifierableNode} from "./ModifierableNode";

export type ExportableNodeExtensionType = Node<ts.Node> & ModifierableNode;

export interface ExportableNode {
    hasExportKeyword(): boolean;
    getExportKeyword(): Node<ts.Node> | undefined;
    hasDefaultKeyword(): boolean;
    getDefaultKeyword(): Node<ts.Node> | undefined;
    isDefaultExport(): boolean;
    setIsDefaultExport(isDefaultExport: boolean): this;
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

            const aliasedSymbol = typeChecker.getAliasedSymbol(defaultExportSymbol);
            return thisSymbol.equals(aliasedSymbol);
        }

        /**
         * Sets if this node is a default export.
         * @param isDefaultExport - If it should be a default export or not.
         */
        setIsDefaultExport(isDefaultExport: boolean) {
            const typeChecker = this.factory.getLanguageService().getProgram().getTypeChecker();
            if (isDefaultExport === this.isDefaultExport(typeChecker))
                return this;

            // remove any existing default export
            const sourceFile = this.getRequiredSourceFile();
            const fileDefaultExportSymbol = sourceFile.getDefaultExportSymbol(typeChecker);

            if (fileDefaultExportSymbol != null)
                sourceFile.removeDefaultExport(typeChecker, fileDefaultExportSymbol);

            // set this node as the one to default export
            if (isDefaultExport) {
                this.addModifier("export");
                this.addModifier("default");
            }

            return this;
        }
    };
}
