import * as ts from "typescript";
import * as errors from "./../../../errors";
import {Node, Identifier} from "./../../common";

// todo: support other types other than identifier
// todo: consolidate these named classes somehow

export type DeclarationNamedNodeExtensionType = Node<ts.Declaration>;

export interface DeclarationNamedNode extends DeclarationNamedNodeExtensionType {
    getNameNode(): Identifier | undefined;
    getName(): string | undefined;
    setName(text: string): this;
}

export function DeclarationNamedNode<T extends Constructor<DeclarationNamedNodeExtensionType>>(Base: T): Constructor<DeclarationNamedNode> & T {
    return class extends Base implements DeclarationNamedNode {
        getNameNode() {
            const compilerNameNode = this.node.name;

            if (compilerNameNode == null)
                return undefined;

            switch (compilerNameNode.kind) {
                case ts.SyntaxKind.Identifier:
                    return this.factory.getIdentifier(compilerNameNode);
                /* istanbul ignore next */
                default:
                    throw errors.getNotImplementedForSyntaxKindError(compilerNameNode.kind);
            }
        }

        getName() {
            const nameNode = this.getNameNode();
            return nameNode == null ? undefined : nameNode.getText();
        }

        setName(text: string) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));
            const nameNode = this.getNameNode();

            if (nameNode == null)
                throw this.getNotImplementedError();

            nameNode.rename(text);
            return this;
        }
    };
}
