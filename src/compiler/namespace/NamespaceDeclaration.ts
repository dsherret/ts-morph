import * as ts from "typescript";
import * as errors from "./../../errors";
import {replaceNodeText} from "./../../manipulation";
import {Logger} from "./../../utils";
import {Node, Identifier} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode, BodiedNode} from "./../base";
import {StatementedNode} from "./../statement";
import {NamespaceChildableNode} from "./NamespaceChildableNode";

export const NamespaceDeclarationBase = NamespaceChildableNode(StatementedNode(DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(BodiedNode(NamedNode(Node))))))));
export class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
    /**
     * Gets the full name of the namespace.
     */
    getName() {
        return this.getNameNodes().map(n => n.getText()).join(".");
    }

    /**
     * Sets the name without renaming.
     * @param newName - New full namespace name.
     */
    setName(newName: string) {
        // todo: implement
        throw new errors.NotImplementedError("Setting the namespace name is not implemented.");
    }

    /**
     * Renames the name.
     * @param newName - New name.
     */
    rename(newName: string) {
        const nameNodes = this.getNameNodes();
        if (nameNodes.length > 1)
            throw new errors.NotSupportedError(`Cannot rename a namespace name that uses dot notation. Rename the individual nodes via .${nameof(this.getNameNodes)}()`);
        if (newName.indexOf(".") >= 0)
            throw new errors.NotSupportedError(`Cannot rename a namespace name to a name containing a period.`);
        nameNodes[0].rename(newName);
        return this;
    }

    /**
     * Gets the name nodes.
     */
    getNameNodes() {
        const nodes: Identifier[] = [];
        let current: Node<ts.NamespaceDeclaration> | undefined = this;
        do {
            nodes.push(this.factory.getIdentifier(current.compilerNode.name, this.sourceFile));
            current = current.getFirstChildByKind(ts.SyntaxKind.ModuleDeclaration) as Node<ts.NamespaceDeclaration>;
        } while (current != null);
        return nodes;
    }

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
