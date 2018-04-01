import {ts, SyntaxKind} from "../../../typescript";
import {Constructor} from "../../../Constructor";
import {NameableNodeStructure} from "../../../structures";
import * as errors from "../../../errors";
import {removeChildren, insertIntoParentTextRange} from "../../../manipulation";
import {StringUtils, TypeGuards} from "../../../utils";
import {Node, Identifier} from "../../common";
import {ReferencedSymbol} from "../../tools";
import {callBaseFill} from "../../callBaseFill";

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
    /**
     * Finds the references of the node.
     */
    findReferences(): ReferencedSymbol[];
    /**
     * Gets the nodes that reference the node.
     */
    getReferencingNodes(): Node[];
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

        findReferences() {
            const nameNode = this.getNameNode();
            if (nameNode != null)
                return nameNode.findReferences();
            return this.global.languageService.findReferences(getNodeForReferences(this));
        }

        getReferencingNodes() {
            const nameNode = this.getNameNode();
            if (nameNode != null)
                return nameNode.getDefinitionReferencingNodes();
            return this.global.languageService.getDefinitionReferencingNodes(getNodeForReferences(this));
        }

        fill(structure: Partial<NameableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.name != null)
                this.rename(structure.name);

            return this;
        }
    };
}

function getNodeForReferences(node: Node) {
    if (TypeGuards.isExportableNode(node))
        return node.getDefaultKeyword() || node;
    return node;
}
