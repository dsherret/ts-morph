import { errors, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../../manipulation";
import { NameableNodeStructure } from "../../../../structures";
import { Constructor } from "../../../../types";
import { callBaseSet } from "../../callBaseSet";
import { Node } from "../../common";
import { Identifier } from "../../name";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { RenameableNode } from "./RenameableNode";

export type NameableNodeExtensionType = Node<ts.Node & { name?: ts.Identifier; }>;

export interface NameableNode extends NameableNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export interface NameableNodeSpecific {
    /**
     * Gets the name node if it exists.
     */
    getNameNode(): Identifier | undefined;
    /**
     * Gets the name node if it exists, or throws.
     */
    getNameNodeOrThrow(): Identifier;
    /**
     * Gets the name if it exists.
     */
    getName(): string | undefined;
    /**
     * Gets the name if it exists, or throws.
     */
    getNameOrThrow(): string;
    /**
     * Removes the name from the node.
     */
    removeName(): this;
}

export function NameableNode<T extends Constructor<NameableNodeExtensionType>>(Base: T): Constructor<NameableNode> & T {
    return NameableNodeInternal(ReferenceFindableNode(RenameableNode(Base)));
}

function NameableNodeInternal<T extends Constructor<NameableNodeExtensionType>>(Base: T): Constructor<NameableNodeSpecific> & T {
    return class extends Base implements NameableNodeSpecific {
        getNameNode() {
            return this._getNodeFromCompilerNodeIfExists(this.compilerNode.name);
        }

        getNameNodeOrThrow() {
            return errors.throwIfNullOrUndefined(this.getNameNode(), "Expected to have a name node.");
        }

        getName() {
            return this.getNameNode()?.getText() ?? undefined; // huh? why was this necessary? bug in optional chaining?
        }

        getNameOrThrow() {
            return errors.throwIfNullOrUndefined(this.getName(), "Expected to have a name.");
        }

        rename(newName: string) {
            if (newName === this.getName())
                return this;

            if (StringUtils.isNullOrWhitespace(newName)) {
                this.removeName();
                return this;
            }

            const nameNode = this.getNameNode();
            if (nameNode == null)
                addNameNode(this, newName);
            else
                Base.prototype.rename.call(this, newName);

            return this;
        }

        removeName() {
            const nameNode = this.getNameNode();

            if (nameNode == null)
                return this;

            removeChildren({ children: [nameNode], removePrecedingSpaces: true });
            return this;
        }

        set(structure: Partial<NameableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.name != null) {
                errors.throwIfWhitespaceOrNotString(structure.name, nameof.full(structure.name));
                const nameNode = this.getNameNode();
                if (nameNode == null)
                    addNameNode(this, structure.name);
                else
                    nameNode.replaceWithText(structure.name);
            }
            else if (structure.hasOwnProperty(nameof(structure.name))) {
                this.removeName();
            }

            return this;
        }

        getStructure() {
            return callBaseGetStructure<NameableNodeStructure>(Base.prototype, this, {
                name: this.getName()
            });
        }
    };
}

function addNameNode(node: Node, newName: string) {
    const openParenToken = node.getFirstChildByKindOrThrow(SyntaxKind.OpenParenToken);
    insertIntoParentTextRange({
        insertPos: openParenToken.getStart(),
        newText: " " + newName,
        parent: node
    });
}
