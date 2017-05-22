import * as ts from "typescript";
import {Logger} from "./../../utils";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode} from "./../base";
import {SourceFile} from "./../file";
import {StatementedNode} from "./../statement";

export const NamespaceDeclarationBase = StatementedNode(DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(NamedNode(Node))))));
export class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasNamespaceKeyword() {
        return (this.node.flags & ts.NodeFlags.Namespace) === ts.NodeFlags.Namespace;
    }

    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasModuleKeyword() {
        return !this.hasNamespaceKeyword();
    }

    /**
     * Set if this namespace has a namepsace keyword.
     * @param value - Whether to set it or not.
     * @param sourceFile - Optional source file to help improve performance.
     */
    setHasNamespaceKeyword(value = true, sourceFile?: SourceFile) {
        if (this.hasNamespaceKeyword() === value)
            return this;

        const declarationTypeKeyword = this.getDeclarationTypeKeyword();
        /* istanbul ignore if */
        if (declarationTypeKeyword == null) {
            Logger.warn("The declaration type keyword of a namespace was undefined.");
            return this;
        }

        sourceFile = sourceFile || this.getRequiredSourceFile();
        sourceFile.replaceText(declarationTypeKeyword.getStart(), declarationTypeKeyword.getEnd(), value ? "namespace" : "module");
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
     * @param sourceFile - Optional source file to help with performance.
     */
    getDeclarationTypeKeyword(sourceFile: SourceFile = this.getRequiredSourceFile()) {
        return this.getFirstChild(child =>
            child.getKind() === ts.SyntaxKind.NamespaceKeyword ||
            child.getKind() === ts.SyntaxKind.ModuleKeyword, sourceFile);
    }
}
