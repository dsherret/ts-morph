import * as errors from "../../../errors";
import { Constructor } from "../../../types";
import { SyntaxKind, ts } from "../../../typescript";
import { Identifier, Node } from "../../common";
import { ReferenceFindableNode } from "./ReferenceFindableNode";
import { RenameableNode } from "./RenameableNode";

// todo: support other types other than identifier
// todo: consolidate these named classes somehow

export type DeclarationNamedNodeExtensionType = Node<ts.NamedDeclaration>;

export interface DeclarationNamedNode extends DeclarationNamedNodeSpecific, ReferenceFindableNode, RenameableNode {
}

export interface DeclarationNamedNodeSpecific {
    /**
     * Gets the name node.
     */
    getNameNode(): Identifier | undefined;
    /**
     * Gets the name node or throws an error if it doesn't exists.
     */
    getNameNodeOrThrow(): Identifier;
    /**
     * Gets the name.
     */
    getName(): string | undefined;
    /**
     * Gets the name or throws if it doens't exist.
     */
    getNameOrThrow(): string;
}

export function DeclarationNamedNode<T extends Constructor<DeclarationNamedNodeExtensionType>>(Base: T): Constructor<DeclarationNamedNode> & T {
    return DeclarationNamedNodeInternal(ReferenceFindableNode(RenameableNode(Base)));
}

function DeclarationNamedNodeInternal<T extends Constructor<DeclarationNamedNodeExtensionType>>(Base: T): Constructor<DeclarationNamedNodeSpecific> & T {
    return class extends Base implements DeclarationNamedNodeSpecific {
        getNameNodeOrThrow() {
            const nameNode = this.getNameNode();
            if (nameNode == null)
                throw new errors.InvalidOperationError("Expected a name node.");
            return nameNode;
        }

        getNameNode() {
            const compilerNameNode = this.compilerNode.name;

            if (compilerNameNode == null)
                return undefined;

            switch (compilerNameNode.kind) {
                case SyntaxKind.Identifier:
                    return this.getNodeFromCompilerNode(compilerNameNode);
                /* istanbul ignore next */
                default:
                    throw errors.getNotImplementedForSyntaxKindError(compilerNameNode.kind);
            }
        }

        getNameOrThrow() {
            return errors.throwIfNullOrUndefined(this.getName(), "Expected to find a name.");
        }

        getName() {
            const nameNode = this.getNameNode();
            return nameNode == null ? undefined : nameNode.getText();
        }
    };
}
