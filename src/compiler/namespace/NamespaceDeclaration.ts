import {ts, SyntaxKind} from "./../../typescript";
import * as errors from "./../../errors";
import {replaceNodeText} from "./../../manipulation";
import {NamespaceDeclarationStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node, Identifier} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, JSDocableNode, BodiedNode, TextInsertableNode, UnwrappableNode,
    ChildOrderableNode} from "./../base";
import {StatementedNode, Statement} from "./../statement";
import {NamespaceChildableNode} from "./NamespaceChildableNode";

export const NamespaceDeclarationBase = ChildOrderableNode(UnwrappableNode(TextInsertableNode(BodiedNode(NamespaceChildableNode(StatementedNode(JSDocableNode(
    AmbientableNode(ExportableNode(ModifierableNode(NamedNode(Statement))))
)))))));
export class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<NamespaceDeclarationStructure>) {
        callBaseFill(NamespaceDeclarationBase.prototype, this, structure);

        if (structure.hasModuleKeyword != null)
            this.setHasModuleKeyword(structure.hasModuleKeyword);

        return this;
    }

    /**
     * Gets the full name of the namespace.
     */
    getName() {
        return this.getNameNodes().map(n => n.getText()).join(".");
    }

    /**
     * Sets the name without renaming references.
     * @param newName - New full namespace name.
     */
    setName(newName: string) {
        const nameNodes = this.getNameNodes();
        const openIssueText = `Please open an issue if you really need this and I'll up the priority.`;
        if (nameNodes.length > 1)
            throw new errors.NotImplementedError(`Not implemented to set a namespace name that uses dot notation. ${openIssueText}`);
        if (newName.indexOf(".") >= 0)
            throw new errors.NotImplementedError(`Not implemented to set a namespace name to a name containing a period. ${openIssueText}`);
        replaceNodeText(this.sourceFile, nameNodes[0].getStart(), nameNodes[0].getEnd(), newName);
        return this;
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
        let current: NamespaceDeclaration | undefined = this;
        do {
            nodes.push(this.getNodeFromCompilerNode<Identifier>(current.compilerNode.name));
            current = current.getFirstChildByKind(SyntaxKind.ModuleDeclaration);
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
        if (declarationTypeKeyword == null)
            throw new errors.NotImplementedError("Expected the declaration type keyword to exist on a namespace.");

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
            child.getKind() === SyntaxKind.NamespaceKeyword ||
            child.getKind() === SyntaxKind.ModuleKeyword);
    }
}
