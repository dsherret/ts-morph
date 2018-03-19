import {ts, SyntaxKind} from "../../../typescript";
import {Constructor} from "../../../Constructor";
import * as errors from "../../../errors";
import {Node, Identifier} from "../../common";

// todo: consolidate these named classes somehow

export type BindingNamedNodeExtensionType = Node<ts.Declaration & { name: ts.BindingName; }>;

export interface BindingNamedNode {
    getNameNode(): Identifier;
    getName(): string;
    /**
     * Renames the name.
     * @param text - New name.
     */
    rename(text: string): this;
}

export function BindingNamedNode<T extends Constructor<BindingNamedNodeExtensionType>>(Base: T): Constructor<BindingNamedNode> & T {
    return class extends Base implements BindingNamedNode {
        getNameNode() {
            const compilerNameNode = this.compilerNode.name;

            switch (compilerNameNode.kind) {
                case SyntaxKind.Identifier:
                    return this.getNodeFromCompilerNode<Identifier>(compilerNameNode);
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
    };
}
