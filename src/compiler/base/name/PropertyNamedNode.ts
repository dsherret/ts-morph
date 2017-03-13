import * as ts from "typescript";
import * as errors from "./../../../errors";
import {Node, Identifier} from "./../../common";

type ExtensionType = Node<ts.EnumMember>; // todo: why do I have to specify EnumMember here?

export interface PropertyNamedNode extends ExtensionType {
    getNameNode(): Identifier;
    getName(): string;
    setName(text: string): this;
}

export function PropertyNamedNode<T extends Constructor<ExtensionType>>(Base: T) {
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
            this.getNameNode().rename(text);
            return this;
        }
    };
}
