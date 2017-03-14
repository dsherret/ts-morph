import * as ts from "typescript";
import * as errors from "./../../../errors";
import {Node, Identifier} from "./../../common";

// todo: consolidate these named classes somehow

type ExtensionType = Node<ts.VariableDeclaration>;

export interface BindingNamedNode extends ExtensionType {
    getNameNode(): Identifier;
    getName(): string;
    setName(text: string): this;
}

export function BindingNamedNode<T extends Constructor<ExtensionType>>(Base: T) {
    return class extends Base implements BindingNamedNode {
        getNameNode() {
            const compilerNameNode = this.node.name;

            switch (compilerNameNode.kind) {
                case ts.SyntaxKind.Identifier:
                    return this.factory.getIdentifier(compilerNameNode);
                /* istanbul ignore next */
                default:
                    throw errors.getNotImplementedForSyntaxKindError(compilerNameNode.kind);
            }
        }

        getName() {
            return this.getNameNode().getText();
        }

        setName(text: string) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));
            this.getNameNode().rename(text);
            return this;
        }
    };
}
