import { errors, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { ModuleDeclarationSpecificStructure, ModuleDeclarationStructure, StructureKind } from "../../../structures";
import { Constructor } from "../../../types";
import { RenameOptions } from "../../tools";
import { AmbientableNode, BodyableNode, ExportableNode, JSDocableNode, ModifierableNode, ModuledNode, ModuleNamedNode, TextInsertableNode,
    UnwrappableNode } from "../base";
import { renameNode } from "../base/helpers";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { StringLiteral } from "../literal";
import { Identifier } from "../name";
import { Statement, StatementedNode } from "../statement";
import { ModuleChildableNode } from "./ModuleChildableNode";
import { ModuleDeclarationKind } from "./ModuleDeclarationKind";

const createBase = <T extends typeof Statement>(ctor: T) =>
    ModuledNode(UnwrappableNode(
        TextInsertableNode(BodyableNode(ModuleChildableNode(StatementedNode(JSDocableNode(AmbientableNode(
            ExportableNode(ModifierableNode(ModuleNamedNode(ctor))),
        )))))),
    ));
export const ModuleDeclarationBase: Constructor<ModuledNode> & Constructor<UnwrappableNode> & Constructor<TextInsertableNode> & Constructor<BodyableNode>
    & Constructor<ModuleChildableNode> & Constructor<StatementedNode> & Constructor<JSDocableNode> & Constructor<AmbientableNode> & Constructor<ExportableNode>
    & Constructor<ModifierableNode> & Constructor<ModuleNamedNode> & typeof Statement = createBase(Statement);
export class ModuleDeclaration extends ModuleDeclarationBase<ts.ModuleDeclaration> {
    /**
     * Gets the full name of the namespace.
     */
    getName() {
        const nameNodesOrStringLit = this.getNameNodes();
        if (nameNodesOrStringLit instanceof Array)
            return nameNodesOrStringLit.map(n => n.getText()).join(".");
        return nameNodesOrStringLit.getText();
    }

    /**
     * Sets the name without renaming references.
     * @param newName - New full namespace name.
     */
    setName(newName: string) {
        const openIssueText = `Please open an issue if you really need this and I'll up the priority.`;
        if (newName.indexOf(".") >= 0)
            throw new errors.NotImplementedError(`Not implemented to set a namespace name to a name containing a period. ${openIssueText}`);

        const moduleName = this.getNameNodes();
        if (moduleName instanceof Array) {
            if (moduleName.length > 1)
                throw new errors.NotImplementedError(`Not implemented to set a namespace name that uses dot notation. ${openIssueText}`);
            if (newName !== "global")
                addNamespaceKeywordIfNecessary(this);
            if (StringUtils.isQuoted(newName))
                changeToAmbientModuleIfNecessary(this);
            moduleName[0].replaceWithText(newName);
        }
        else {
            moduleName.replaceWithText(newName);
        }
        return this;
    }

    /**
     * Renames the module name.
     *
     * Note: The TS compiler does not update module declarations for string literal module names unfortunately.
     * @param newName - New name.
     * @param options - Options for renaming.
     */
    rename(newName: string, options?: RenameOptions) {
        if (newName.indexOf(".") >= 0)
            throw new errors.NotSupportedError(`Cannot rename a namespace name to a name containing a period.`);

        const nameNodes = this.getNameNodes();
        if (nameNodes instanceof Array) {
            if (nameNodes.length > 1) {
                throw new errors.NotSupportedError(
                    `Cannot rename a namespace name that uses dot notation. Rename the individual nodes via .${nameof(this.getNameNodes)}()`,
                );
            }
            if (newName !== "global")
                addNamespaceKeywordIfNecessary(this);
            nameNodes[0].rename(newName, options);
        }
        else {
            renameNode(
                nameNodes,
                StringUtils.stripQuotes(newName),
                options,
            );
        }
        return this;
    }

    /**
     * Gets the name nodes or the string literal.
     */
    getNameNodes(): Identifier[] | StringLiteral {
        const name = this.getNameNode();
        if (Node.isStringLiteral(name))
            return name;
        else {
            const nodes: Identifier[] = [];
            let current: ModuleDeclaration | undefined = this;
            do {
                nodes.push(this._getNodeFromCompilerNode(current.compilerNode.name as ts.Identifier));
                current = current.getFirstChildByKind(SyntaxKind.ModuleDeclaration);
            } while (current != null);
            return nodes;
        }
    }

    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasNamespaceKeyword() {
        return this.getDeclarationKind() === ModuleDeclarationKind.Namespace;
    }

    /**
     * Gets if this namespace has a namespace keyword.
     */
    hasModuleKeyword() {
        return this.getDeclarationKind() === ModuleDeclarationKind.Module;
    }

    /**
     * Sets the namespace declaration kind.
     * @param kind - Kind to set.
     */
    setDeclarationKind(kind: ModuleDeclarationKind) {
        if (this.getDeclarationKind() === kind)
            return this;

        if (kind === ModuleDeclarationKind.Global) {
            const declarationKindKeyword = this.getDeclarationKindKeyword();

            this.getNameNode().replaceWithText("global");

            if (declarationKindKeyword != null) {
                removeChildren({
                    children: [declarationKindKeyword],
                    removeFollowingNewLines: true,
                    removeFollowingSpaces: true,
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
                    newText: kind + " ",
                });
            }
        }

        return this;
    }

    /**
     * Gets the namesapce declaration kind.
     */
    getDeclarationKind() {
        const nodeFlags = this.getFlags();
        if ((nodeFlags & ts.NodeFlags.GlobalAugmentation) !== 0)
            return ModuleDeclarationKind.Global;
        if ((nodeFlags & ts.NodeFlags.Namespace) !== 0)
            return ModuleDeclarationKind.Namespace;
        return ModuleDeclarationKind.Module;
    }

    /**
     * Gets the namespace or module keyword or returns undefined if it's global.
     */
    getDeclarationKindKeyword() {
        return this.getFirstChild(child =>
            child.getKind() === SyntaxKind.NamespaceKeyword
            || child.getKind() === SyntaxKind.ModuleKeyword
        );
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<ModuleDeclarationStructure>) {
        if (structure.name != null && structure.name !== "global")
            addNamespaceKeywordIfNecessary(this);

        callBaseSet(ModuleDeclarationBase.prototype, this, structure);

        if (structure.declarationKind != null)
            this.setDeclarationKind(structure.declarationKind);

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): ModuleDeclarationStructure {
        return callBaseGetStructure<ModuleDeclarationSpecificStructure>(ModuleDeclarationBase.prototype, this, {
            kind: StructureKind.Module,
            declarationKind: this.getDeclarationKind(),
        });
    }

    /** @internal */
    _getInnerBody() {
        let node = this.getBody();
        while (node != null && Node.isBodyableNode(node) && (node.compilerNode as ts.Node as ts.Block).statements == null)
            node = node.getBody();
        return node;
    }
}

function addNamespaceKeywordIfNecessary(namespaceDec: ModuleDeclaration) {
    if (namespaceDec.getDeclarationKind() === ModuleDeclarationKind.Global)
        namespaceDec.setDeclarationKind(ModuleDeclarationKind.Namespace);
}

function changeToAmbientModuleIfNecessary(namespaceDec: ModuleDeclaration) {
    if (namespaceDec.hasNamespaceKeyword())
        namespaceDec.setDeclarationKind(ModuleDeclarationKind.Module);
    if (!namespaceDec.hasDeclareKeyword())
        namespaceDec.setHasDeclareKeyword(true);
}
