import * as errors from "../../../errors";
import { Constructor } from "../../../types";
import { SyntaxKind, ts } from "../../../typescript";
import { Identifier, Node } from "../../common";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { callBaseGetStructure } from "../../callBaseGetStructure";
import { BindingNamedNodeStructure } from "../../../structures";

// todo: consolidate these named classes somehow

export type BindingNamedNodeExtensionType = Node<ts.Declaration & { name: ts.BindingName; }>;

export interface BindingNamedNode extends BindingNamedNodeSpecific, ReferenceFindableNode {
}

export interface BindingNamedNodeSpecific {
    /**
     * Gets the declaration's name node.
     */
    getNameNode(): Identifier;
    /**
     * Gets the declaration's name as a string.
     */
    getName(): string;
    /**
     * Renames the name.
     * @param text - New name.
     */
    rename(text: string): this;
}

export function BindingNamedNode<T extends Constructor<BindingNamedNodeExtensionType>>(Base: T): Constructor<BindingNamedNode> & T {
    return BindingNamedNodeInternal(ReferenceFindableNode(Base));
}

function BindingNamedNodeInternal<T extends Constructor<BindingNamedNodeExtensionType>>(Base: T): Constructor<BindingNamedNodeSpecific> & T {
    return class extends Base implements BindingNamedNodeSpecific {
        getNameNode() {
            const compilerNameNode = this.compilerNode.name;

            switch (compilerNameNode.kind) {
                case SyntaxKind.Identifier:
                    return this.getNodeFromCompilerNode(compilerNameNode);
                /* istanbul ignore next */
                default:
                    throw errors.getNotImplementedForSyntaxKindError(compilerNameNode.kind);
            }
        }

        getName() {
            return this.getNameNode().getText();
        }

        rename(text: string) {
            errors.throwIfNotStringOrWhitespace(text, nameof(text));
            this.getNameNode().rename(text);
            return this;
        }

        getStructure() {
            return callBaseGetStructure<BindingNamedNodeStructure>(Base.prototype, this, {
                name: this.getName()
            });
        }
    };
}
