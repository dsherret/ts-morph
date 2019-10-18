import { errors, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { insertIntoParentTextRange, removeChildren } from "../../../manipulation";
import { TypedNodeStructure } from "../../../structures";
import { Constructor, WriterFunction } from "../../../types";
import { getTextFromStringOrWriter } from "../../../utils";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { TypeNode } from "../type/TypeNode";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type TypedNodeExtensionType = Node<ts.Node & { type?: ts.TypeNode; }>;

export interface TypedNode {
    /**
     * Gets the type node or undefined if none exists.
     */
    getTypeNode(): TypeNode | undefined;
    /**
     * Gets the type node or throws if none exists.
     */
    getTypeNodeOrThrow(): TypeNode;
    /**
     * Sets the type.
     * @param textOrWriterFunction - Text or writer function to set the type with.
     */
    setType(textOrWriterFunction: string | WriterFunction): this;
    /**
     * Removes the type.
     */
    removeType(): this;
}

export function TypedNode<T extends Constructor<TypedNodeExtensionType>>(Base: T): Constructor<TypedNode> & T {
    return class extends Base implements TypedNode {
        getTypeNode() {
            return this._getNodeFromCompilerNodeIfExists(this.compilerNode.type);
        }

        getTypeNodeOrThrow() {
            return errors.throwIfNullOrUndefined(this.getTypeNode(), "Expected to find a type node.");
        }

        setType(textOrWriterFunction: string | WriterFunction) {
            const text = getTextFromStringOrWriter(this._getWriterWithQueuedChildIndentation(), textOrWriterFunction);
            if (StringUtils.isNullOrWhitespace(text))
                return this.removeType();

            const typeNode = this.getTypeNode();
            if (typeNode != null && typeNode.getText() === text)
                return this;

            // remove previous type
            const separatorSyntaxKind = getSeparatorSyntaxKindForNode(this);
            const separatorNode = this.getFirstChildByKind(separatorSyntaxKind);

            let insertPos: number;
            let newText: string;

            if (separatorNode == null) {
                insertPos = getInsertPosWhenNoType(this);
                newText = (separatorSyntaxKind === SyntaxKind.EqualsToken ? " = " : ": ") + text;
            }
            else {
                insertPos = typeNode!.getStart();
                newText = text;
            }

            // insert new type
            insertIntoParentTextRange({
                parent: this,
                insertPos,
                newText,
                replacing: {
                    textLength: typeNode == null ? 0 : typeNode.getWidth()
                }
            });

            return this;

            function getInsertPosWhenNoType(node: Node) {
                const identifier = node.getFirstChildByKindOrThrow(SyntaxKind.Identifier);
                const nextSibling = identifier.getNextSibling();
                const insertAfterNode = isQuestionOrExclamation(nextSibling) ? nextSibling : identifier;

                return insertAfterNode.getEnd();
            }

            function isQuestionOrExclamation(node: Node | undefined): node is Node {
                if (node == null)
                    return false;
                const kind = node.getKind();
                return kind === SyntaxKind.QuestionToken || kind === SyntaxKind.ExclamationToken;
            }
        }

        set(structure: Partial<TypedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.type != null)
                this.setType(structure.type);
            else if (structure.hasOwnProperty(nameof(structure.type)))
                this.removeType();

            return this;
        }

        removeType() {
            if (this.getKind() === SyntaxKind.TypeAliasDeclaration)
                throw new errors.NotSupportedError(`Cannot remove the type of a type alias. Use ${nameof<TypedNode>(t => t.setType)} instead.`);

            const typeNode = this.getTypeNode();
            if (typeNode == null)
                return this;

            const separatorToken = typeNode.getPreviousSiblingIfKindOrThrow(getSeparatorSyntaxKindForNode(this));
            removeChildren({ children: [separatorToken, typeNode], removePrecedingSpaces: true });
            return this;
        }

        getStructure() {
            const typeNode = this.getTypeNode();
            return callBaseGetStructure<TypedNodeStructure>(Base.prototype, this, {
                type: typeNode ? typeNode.getText({ trimLeadingIndentation: true }) : undefined
            });
        }
    };
}

function getSeparatorSyntaxKindForNode(node: Node) {
    switch (node.getKind()) {
        case SyntaxKind.TypeAliasDeclaration:
            return SyntaxKind.EqualsToken;
        default:
            return SyntaxKind.ColonToken;
    }
}
