import * as ts from "typescript";
import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {Node, Identifier} from "./../../common";

// todo: support other types other than identifier
// todo: consolidate these named classes somehow

export type DeclarationNamedNodeExtensionType = Node<ts.NamedDeclaration>;

export interface DeclarationNamedNode {
    /**
     * Gets the name node.
     */
    getNameIdentifier(): Identifier | undefined;
    /**
     * Gets the name node or throws an error if it doesn't exists.
     */
    getNameIdentifierOrThrow(): Identifier;
    /**
     * Gets the name.
     */
    getName(): string | undefined;
    /**
     * Renames the name.
     * @param text - Text to set as the name.
     */
    rename(text: string): this;
}

export function DeclarationNamedNode<T extends Constructor<DeclarationNamedNodeExtensionType>>(Base: T): Constructor<DeclarationNamedNode> & T {
    return class extends Base implements DeclarationNamedNode {
        getNameIdentifierOrThrow() {
            const nameNode = this.getNameIdentifier();
            if (nameNode == null)
                throw new errors.InvalidOperationError("Expected a name node.");
            return nameNode;
        }

        getNameIdentifier() {
            const compilerNameNode = this.compilerNode.name;

            if (compilerNameNode == null)
                return undefined;

            switch (compilerNameNode.kind) {
                case ts.SyntaxKind.Identifier:
                    return this.factory.getIdentifier(compilerNameNode, this.sourceFile);
                /* istanbul ignore next */
                default:
                    throw errors.getNotImplementedForSyntaxKindError(compilerNameNode.kind);
            }
        }

        getName() {
            const nameNode = this.getNameIdentifier();
            return nameNode == null ? undefined : nameNode.getText();
        }

        rename(text: string) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));
            const nameNode = this.getNameIdentifier();

            if (nameNode == null)
                throw errors.getNotImplementedForSyntaxKindError(this.getKind());

            nameNode.rename(text);
            return this;
        }
    };
}
