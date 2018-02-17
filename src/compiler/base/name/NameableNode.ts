import {ts, SyntaxKind} from "./../../../typescript";
import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {removeChildren, insertIntoParentTextRange} from "./../../../manipulation";
import {StringUtils} from "./../../../utils";
import {Node, Identifier} from "./../../common";

export type NameableNodeExtensionType = Node<ts.Node & { name?: ts.Identifier; }>;

export interface NameableNode {
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
    return class extends Base implements NameableNode {
        getNameNode() {
            return this.getNodeFromCompilerNodeIfExists<Identifier>(this.compilerNode.name);
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
    };
}
