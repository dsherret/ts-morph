import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { removeChildren, insertIntoParentTextRange } from "../../../manipulation";
import { NamespaceDeclarationStructure, NamespaceDeclarationSpecificStructure, StructureKind } from "../../../structures";
import { AmbientableNode, BodiedNode, ExportableNode, JSDocableNode, ModifierableNode, NamedNode, TextInsertableNode, UnwrappableNode,
    ModuledNode } from "../base";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Identifier } from "../name";
import { Statement, StatementedNode } from "../statement";
import { NamespaceChildableNode } from "./NamespaceChildableNode";
import { NamespaceDeclarationKind } from "./NamespaceDeclarationKind";
import { Node } from "../common";

const createBase = <T extends typeof Statement>(ctor: T) => ModuledNode(UnwrappableNode(
    TextInsertableNode(BodiedNode(NamespaceChildableNode(StatementedNode(JSDocableNode(AmbientableNode(
        ExportableNode(ModifierableNode(NamedNode(ctor)))
    ))))))
));
export const NamespaceDeclarationBase = createBase(Statement);
export class NamespaceDeclaration extends NamespaceDeclarationBase<ts.NamespaceDeclaration> {
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
        if (newName !== "global")
            addNamespaceKeywordIfNecessary(this);
        nameNodes[0].replaceWithText(newName);
        return this;
    }

    /**
     * Renames the name.
     * @param newName - New name.
     */
    rename(newName: string) {
        const nameNodes = this.getNameNodes();
        if (nameNodes.length > 1) {
            throw new errors.NotSupportedError(
                `Cannot rename a namespace name that uses dot notation. Rename the individual nodes via .${nameof(this.getNameNodes)}()`
            );
        }
        if (newName.indexOf(".") >= 0)
            throw new errors.NotSupportedError(`Cannot rename a namespace name to a name containing a period.`);
        if (newName !== "global")
            addNamespaceKeywordIfNecessary(this);
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
            nodes.push(this._getNodeFromCompilerNode(current.compilerNode.name));
            current = current.getFirstChildByKind(SyntaxKind.ModuleDeclaration);
        } while (current != null);
        return nodes;
    }

    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasNamespaceKeyword() {
        return this.getDeclarationKind() === NamespaceDeclarationKind.Namespace;
    }

    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasModuleKeyword() {
        return this.getDeclarationKind() === NamespaceDeclarationKind.Module;
    }

    /**
     * Sets the namespace declaration kind.
     * @param kind - Kind to set.
     */
    setDeclarationKind(kind: NamespaceDeclarationKind) {
        if (this.getDeclarationKind() === kind)
            return this;

        if (kind === NamespaceDeclarationKind.Global) {
            const declarationKindKeyword = this.getDeclarationKindKeyword();

            this.getNameNode().replaceWithText("global");

            if (declarationKindKeyword != null) {
                removeChildren({
                    children: [declarationKindKeyword],
                    removeFollowingNewLines: true,
                    removeFollowingSpaces: true
                });
            }
        }
        else {
            const declarationKindKeyword = this.getDeclarationKindKeyword();

            if (declarationKindKeyword != null)
                declarationKindKeyword.replaceWithText(kind);
            else {
                insertIntoParentTextRange({
                    parent: this,
                    insertPos: this.getNameNode().getStart(),
                    newText: kind + " "
                });
            }
        }

        return this;
    }

    /**
     * Gets the namesapce declaration kind.
     */
    getDeclarationKind() {
        const declarationKeyword = this.getDeclarationKindKeyword();
        if (declarationKeyword == null)
            return NamespaceDeclarationKind.Global;
        return declarationKeyword.getKind() === SyntaxKind.NamespaceKeyword ? NamespaceDeclarationKind.Namespace : NamespaceDeclarationKind.Module;
    }

    /**
     * Gets the namespace or module keyword or returns undefined if it's global.
     */
    getDeclarationKindKeyword() {
        return this.getFirstChild(child => child.getKind() === SyntaxKind.NamespaceKeyword
            || child.getKind() === SyntaxKind.ModuleKeyword);
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<NamespaceDeclarationStructure>) {
        if (structure.name != null && structure.name !== "global")
            addNamespaceKeywordIfNecessary(this);

        callBaseSet(NamespaceDeclarationBase.prototype, this, structure);

        if (structure.declarationKind != null)
            this.setDeclarationKind(structure.declarationKind);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): NamespaceDeclarationStructure {
        return callBaseGetStructure<NamespaceDeclarationSpecificStructure>(NamespaceDeclarationBase.prototype, this, {
            kind: StructureKind.Namespace,
            declarationKind: this.getDeclarationKind()
        });
    }

    /** @internal */
    _getInnerBody() {
        let node = this.getBody();
        while (Node.isBodiedNode(node) && (node.compilerNode as ts.Node as ts.Block).statements == null)
            node = node.getBody();
        return node;
    }
}

function addNamespaceKeywordIfNecessary(namespaceDec: NamespaceDeclaration) {
    if (namespaceDec.getDeclarationKind() === NamespaceDeclarationKind.Global)
        namespaceDec.setDeclarationKind(NamespaceDeclarationKind.Namespace);
}
