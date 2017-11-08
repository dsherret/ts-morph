import * as ts from "typescript";
import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {removeChildren, insertIntoParent} from "./../../../manipulation";
import {StringUtils} from "./../../../utils";
import {Node, Identifier} from "./../../common";

export type NameableNodeExtensionType = Node<ts.Node & { name?: ts.Identifier; }>;

export interface NameableNode {
    /**
     * Gets the name node if it exists.
     */
    getNameIdentifier(): Identifier | undefined;
    /**
     * Gets the name node if it exists, or throws.
     */
    getNameIdentifierOrThrow(): Identifier;
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
    return class extends Base implements NameableNode {
        getNameIdentifier() {
            const nameNode = this.compilerNode.name;
            if (nameNode == null)
                return undefined;
            return this.global.compilerFactory.getNodeFromCompilerNode(nameNode, this.sourceFile) as Identifier;
        }

        getNameIdentifierOrThrow() {
            return errors.throwIfNullOrUndefined(this.getNameIdentifier(), "Expected to have a name identifier.");
        }

        getName() {
            const identifier = this.getNameIdentifier();
            return identifier == null ? undefined : identifier.getText();
        }

        getNameOrThrow() {
            return errors.throwIfNullOrUndefined(this.getName(), "Expected to have a name.");
        }

        rename(newName: string) {
            if (newName === this.getName())
                return this;

            const nameIdentifier = this.getNameIdentifier();

            if (StringUtils.isNullOrWhitespace(newName)) {
                if (nameIdentifier == null)
                    return this;

                removeChildren({ children: [nameIdentifier], removePrecedingSpaces: true });
                return this;
            }

            if (nameIdentifier == null) {
                const openParenToken = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenParenToken);
                insertIntoParent({
                    childIndex: openParenToken.getChildIndex(),
                    insertItemsCount: 1,
                    insertPos: openParenToken.getStart(),
                    newText: " " + newName,
                    parent: this
                });
            }
            else
                nameIdentifier.rename(newName);

            return this;
        }
    };
}
