import * as ts from "typescript";
import {Node} from "./../common";
import {ModifierableNode} from "./ModifierableNode";

export type ExportableNodeExtensionType = Node<ts.Node> & ModifierableNode;

export interface ExportableNode {
    hasExportKeyword(): boolean;
    getExportKeyword(): Node<ts.Node> | undefined;
    hasDefaultKeyword(): boolean;
    getDefaultKeyword(): Node<ts.Node> | undefined;
    isDefaultExport(): boolean;
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
        isDefaultExport() {
            if (this.hasDefaultKeyword())
                return true;

            const typeChecker = this.factory.getLanguageService().getProgram().getTypeChecker();
            const thisSymbol = this.getSymbol(typeChecker);
            const sourceFileSymbol = typeChecker.getSymbolAtLocation(this.getRequiredSourceFile());

            // will be undefined when the source file doesn't have an export
            if (sourceFileSymbol == null)
                return false;

            const defaultExportSymbol = sourceFileSymbol.getExportByName("default");

            if (defaultExportSymbol == null || thisSymbol == null)
                return false;

            if (thisSymbol.equals(defaultExportSymbol))
                return true;

            const aliasedSymbol = typeChecker.getAliasedSymbol(defaultExportSymbol);
            return thisSymbol.equals(aliasedSymbol);
        }
    };
}
