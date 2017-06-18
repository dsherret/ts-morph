import * as ts from "typescript";
import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {Node, Identifier} from "./../../common";

export type PropertyNamedNodeExtensionType = Node<ts.Node & { name: ts.PropertyName; }>;

export interface PropertyNamedNode {
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
                    return this.factory.getIdentifier(compilerNameNode, this.sourceFile);
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
