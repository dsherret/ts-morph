import { errors, SyntaxKind } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { ModifierableNode } from "../ModifierableNode";

export type ExportGetableNodeExtensionType = Node;

export interface ExportGetableNode {
    /**
     * If the node has the export keyword.
     */
    hasExportKeyword(): boolean;
    /**
     * Gets the export keyword or undefined if none exists.
     */
    getExportKeyword(): Node | undefined;
    /**
     * Gets the export keyword or throws if none exists.
     */
    getExportKeywordOrThrow(): Node;
    /**
     * If the node has the default keyword.
     */
    hasDefaultKeyword(): boolean;
    /**
     * Gets the default keyword or undefined if none exists.
     */
    getDefaultKeyword(): Node | undefined;
    /**
     * Gets the default keyword or throws if none exists.
     */
    getDefaultKeywordOrThrow(): Node;
    /**
     * Gets if the node is exported from a namespace, is a default export, or is a named export.
     */
    isExported(): boolean;
    /**
     * Gets if this node is a default export of a file.
     */
    isDefaultExport(): boolean;
    /**
     * Gets if this node is a named export of a file.
     */
    isNamedExport(): boolean;
}

export function ExportGetableNode<T extends Constructor<ExportGetableNodeExtensionType>>(Base: T): Constructor<ExportGetableNode> & T {
    return class extends Base implements ExportGetableNode {
        hasExportKeyword() {
            return this.getExportKeyword() != null;
        }

        getExportKeyword() {
            if (Node.isVariableDeclaration(this)) {
                const variableStatement = this.getVariableStatement();
                return variableStatement?.getExportKeyword();
            }
            if (!Node.isModifierableNode(this))
                return throwForNotModifierableNode();
            return this.getFirstModifierByKind(SyntaxKind.ExportKeyword);
        }

        getExportKeywordOrThrow() {
            return errors.throwIfNullOrUndefined(this.getExportKeyword(), "Expected to find an export keyword.");
        }

        hasDefaultKeyword() {
            return this.getDefaultKeyword() != null;
        }

        getDefaultKeyword() {
            if (Node.isVariableDeclaration(this)) {
                const variableStatement = this.getVariableStatement();
                return variableStatement?.getDefaultKeyword();
            }
            if (!Node.isModifierableNode(this))
                return throwForNotModifierableNode();
            return this.getFirstModifierByKind(SyntaxKind.DefaultKeyword);
        }

        getDefaultKeywordOrThrow() {
            return errors.throwIfNullOrUndefined(this.getDefaultKeyword(), "Expected to find a default keyword.");
        }

        isExported() {
            if (this.hasExportKeyword())
                return true;

            const thisSymbol = this.getSymbol();
            const sourceFileSymbol = this.getSourceFile().getSymbol();
            if (thisSymbol == null || sourceFileSymbol == null)
                return false;

            return sourceFileSymbol.getExports().some(e => e === thisSymbol || e.getAliasedSymbol() === thisSymbol);
        }

        isDefaultExport() {
            if (this.hasDefaultKeyword())
                return true;

            const thisSymbol = this.getSymbol();
            if (thisSymbol == null)
                return false;

            const defaultExportSymbol = this.getSourceFile().getDefaultExportSymbol();
            if (defaultExportSymbol == null)
                return false;

            if (thisSymbol === defaultExportSymbol)
                return true;

            const aliasedSymbol = defaultExportSymbol.getAliasedSymbol();
            return thisSymbol === aliasedSymbol;
        }

        isNamedExport() {
            const thisSymbol = this.getSymbol();
            const sourceFileSymbol = this.getSourceFile().getSymbol();
            if (thisSymbol == null || sourceFileSymbol == null)
                return false;

            return !isDefaultExport() && sourceFileSymbol.getExports().some(e => e === thisSymbol || e.getAliasedSymbol() === thisSymbol);

            function isDefaultExport() {
                const defaultExportSymbol = sourceFileSymbol!.getExport("default");
                if (defaultExportSymbol == null)
                    return false;
                return thisSymbol === defaultExportSymbol || thisSymbol === defaultExportSymbol.getAliasedSymbol();
            }
        }
    };
}

function throwForNotModifierableNode(): never {
    throw new errors.NotImplementedError(`Not implemented situation where node was not a ${nameof(ModifierableNode)}.`);
}
