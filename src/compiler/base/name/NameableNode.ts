import { ts, SyntaxKind } from "../../../typescript";
import { Constructor } from "../../../types";
import { NameableNodeStructure } from "../../../structures";
import * as errors from "../../../errors";
import { removeChildren, insertIntoParentTextRange } from "../../../manipulation";
import { StringUtils, TypeGuards } from "../../../utils";
import { Node, Identifier } from "../../common";
import { ReferencedSymbol } from "../../tools";
import { callBaseFill } from "../../callBaseFill";
import { ReferenceFindableNode } from "./ReferenceFindableNode";

export type NameableNodeExtensionType = Node<ts.Node & { name?: ts.Identifier; }>;

export interface NameableNode extends NameableNodeSpecific, ReferenceFindableNode {
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
     * Renames the name or sets the name if it doesn't exist.
     * @param newName - New name.
     */
    rename(newName: string): this;
}

export function NameableNode<T extends Constructor<NameableNodeExtensionType>>(Base: T): Constructor<NameableNode> & T {
    return NameableNodeInternal(ReferenceFindableNode(Base));
}

function NameableNodeInternal<T extends Constructor<NameableNodeExtensionType>>(Base: T): Constructor<NameableNodeSpecific> & T {
    return class extends Base implements NameableNodeSpecific {
        getNameNode() {
            return this.getNodeFromCompilerNodeIfExists(this.compilerNode.name);
        }

        getNameNodeOrThrow() {
            return errors.throwIfNullOrUndefined(this.getNameNode(), "Expected to have a name node.");
        }

        getName() {
            const identifier = this.getNameNode();
            return identifier == null ? undefined : identifier.getText();
        }

        getNameOrThrow() {
            return errors.throwIfNullOrUndefined(this.getName(), "Expected to have a name.");
        }

        rename(newName: string) {
            if (newName === this.getName())
                return this;

            const nameNode = this.getNameNode();

            if (StringUtils.isNullOrWhitespace(newName)) {
                if (nameNode == null)
                    return this;

                removeChildren({ children: [nameNode], removePrecedingSpaces: true });
                return this;
            }

            if (nameNode == null) {
                const openParenToken = this.getFirstChildByKindOrThrow(SyntaxKind.OpenParenToken);
                insertIntoParentTextRange({
                    insertPos: openParenToken.getStart(),
                    newText: " " + newName,
                    parent: this
                });
            }
            else
                nameNode.rename(newName);

            return this;
        }

        fill(structure: Partial<NameableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.name != null)
                this.rename(structure.name);

            return this;
        }
    };
}
