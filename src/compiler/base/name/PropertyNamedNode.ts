import * as ts from "typescript";
import * as errors from "./../../../errors";
import {Node, Identifier} from "./../../common";

export type PropertyNamedNodeExtensionType = Node<ts.EnumMember>; // todo: why do I have to specify EnumMember here?

export interface PropertyNamedNode extends PropertyNamedNodeExtensionType {
    getNameNode(): Identifier;
    getName(): string;
    setName(text: string): this;
}

export function PropertyNamedNode<T extends Constructor<PropertyNamedNodeExtensionType>>(Base: T): Constructor<PropertyNamedNode> & T {
    return class extends Base implements PropertyNamedNode {
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
