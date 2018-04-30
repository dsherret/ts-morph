import { ts, SyntaxKind } from "../../typescript";
import { CodeBlockWriter } from "../../codeBlockWriter";
import { Constructor } from "../../Constructor";
import { TypedNodeStructure } from "../../structures";
import { callBaseFill } from "../callBaseFill";
import * as errors from "../../errors";
import { insertIntoParentTextRange, removeChildren } from "../../manipulation";
import { StringUtils, getTextFromStringOrWriter } from "../../utils";
import { Node } from "../common";
import { Type } from "../type/Type";
import { TypeNode } from "../type/TypeNode";

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
     * @param writerFunction - Writer function to set the type with.
     */
    setType(writerFunction: (writer: CodeBlockWriter) => void): this;
    /**
     * Sets the type.
     * @param text - Text to set the type to.
     */
    setType(text: string): this;
    /**
     * Removes the type.
     */
    removeType(): this;
}

export function TypedNode<T extends Constructor<TypedNodeExtensionType>>(Base: T): Constructor<TypedNode> & T {
    return class extends Base implements TypedNode {
        getTypeNode() {
            return this.getNodeFromCompilerNodeIfExists<TypeNode>(this.compilerNode.type);
        }

        getTypeNodeOrThrow() {
            return errors.throwIfNullOrUndefined(this.getTypeNode(), "Expected to find a type node.");
        }

        setType(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
            const text = getTextFromStringOrWriter(this.getWriterWithQueuedChildIndentation(), textOrWriterFunction);
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
                const identifier = this.getFirstChildByKindOrThrow(SyntaxKind.Identifier);
                insertPos = identifier.getEnd();
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
        }

        fill(structure: Partial<TypedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.type != null)
                this.setType(structure.type);

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
