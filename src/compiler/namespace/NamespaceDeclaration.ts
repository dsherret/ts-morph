import * as ts from "typescript";
import {replaceNodeText} from "./../../manipulation";
import {Logger} from "./../../utils";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode, BodiedNode} from "./../base";
import {StatementedNode} from "./../statement";
import {NamespaceChildableNode} from "./NamespaceChildableNode";

export const NamespaceDeclarationBase = NamespaceChildableNode(StatementedNode(DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(BodiedNode(NamedNode(Node))))))));
export class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasNamespaceKeyword() {
        return (this.compilerNode.flags & ts.NodeFlags.Namespace) === ts.NodeFlags.Namespace;
    }

    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasModuleKeyword() {
        return !this.hasNamespaceKeyword();
    }

    /**
     * Set if this namespace has a namespace keyword.
     * @param value - Whether to set it or not.
     */
    setHasNamespaceKeyword(value = true) {
        if (this.hasNamespaceKeyword() === value)
            return this;

        const declarationTypeKeyword = this.getDeclarationTypeKeyword();
        /* istanbul ignore if */
        if (declarationTypeKeyword == null) {
            Logger.warn("The declaration type keyword of a namespace was undefined.");
            return this;
        }

        replaceNodeText(this.getSourceFile(), declarationTypeKeyword.getStart(), declarationTypeKeyword.getEnd(), value ? "namespace" : "module");
        return this;
    }

    /**
     * Set if this namespace has a namepsace keyword.
     * @param value - Whether to set it or not.
     */
    setHasModuleKeyword(value = true) {
        return this.setHasNamespaceKeyword(!value);
    }

    /**
     * Gets the namespace or module keyword.
     */
    getDeclarationTypeKeyword() {
        return this.getFirstChild(child =>
            child.getKind() === ts.SyntaxKind.NamespaceKeyword ||
            child.getKind() === ts.SyntaxKind.ModuleKeyword);
    }
}
