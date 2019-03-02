import * as errors from "../../../../errors";
import { Constructor } from "../../../../types";
import { SyntaxKind } from "../../../../typescript";
import { TypeGuards } from "../../../../utils";
import { Node } from "../../common";
import { ModifierableNode } from "../ModifierableNode";
import { VariableStatement } from "../../statement";
import { VariableDeclaration } from "../../variable";

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
            if (TypeGuards.isVariableDeclaration(this)) {
                const variableStatement = this.getVariableStatement();
                return variableStatement == null ? undefined : variableStatement.getExportKeyword();
            }
            if (!TypeGuards.isModifierableNode(this))
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
            if (TypeGuards.isVariableDeclaration(this)) {
                const variableStatement = this.getVariableStatement();
                return variableStatement == null ? undefined : variableStatement.getDefaultKeyword();
            }
            if (!TypeGuards.isModifierableNode(this))
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

            if (!isSourceFileChild(this))
                return false;

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
            return isSourceFileChild(this) && this.hasExportKeyword() && !this.hasDefaultKeyword();
        }
    };
}

function isSourceFileChild(node: Node) {
    const sourceFileParent = getSourceFileParent();
    return sourceFileParent == null ? false : TypeGuards.isSourceFile(sourceFileParent);

    function getSourceFileParent() {
        if (TypeGuards.isVariableDeclaration(node)) {
            const variableStatement = node.getVariableStatement();
            return variableStatement == null ? undefined : variableStatement.getParent();
        }
        return node.getParentOrThrow();
    }
}

function throwForNotModifierableNode(): never {
    throw new errors.NotImplementedError(`Not implemented situation where node was not a ${nameof(ModifierableNode)}.`);
}
