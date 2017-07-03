import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {replaceStraight} from "./../../manipulation";
import {Node} from "./../common";
import {Type} from "./../type/Type";
import {TypeNode} from "./../type/TypeNode";

export type TypedNodeExtensionType = Node<ts.Node & { type?: ts.TypeNode; }>;

export interface TypedNode {
    /**
     * Gets the type.
     */
    getType(): Type;
    /**
     * Gets the type node or undefined if none exists.
     */
    getTypeNode(): TypeNode | undefined;
    /**
     * Sets the type.
     * @param text - Text to set the type to.
     */
    setType(text: string): this;
}

export function TypedNode<T extends Constructor<TypedNodeExtensionType>>(Base: T): Constructor<TypedNode> & T {
    return class extends Base implements TypedNode {
        getType() {
            return this.global.typeChecker.getTypeAtLocation(this);
        }

        getTypeNode() {
            return this.compilerNode.type == null ? undefined : this.global.compilerFactory.getTypeNode(this.compilerNode.type, this.sourceFile);
        }

        setType(text: string) {
            const typeNode = this.getTypeNode();
            if (typeNode != null && typeNode.getText() === text)
                return this;

            // remove previous type
            const separatorSyntaxKind = getSeparatorSyntaxKindForNode(this);
            const separatorNode = this.getFirstChildByKind(separatorSyntaxKind);
            const replaceLength = typeNode == null ? 0 : typeNode.getWidth();

            let insertPosition: number;
            let insertText = "";

            if (separatorNode == null)
                insertText += separatorSyntaxKind === ts.SyntaxKind.EqualsToken ? " = " : ": ";

            if (typeNode == null) {
                const identifier = this.getFirstChildByKindOrThrow(ts.SyntaxKind.Identifier);
                insertPosition = identifier.getEnd();
            }
            else {
                insertPosition = typeNode.getStart();
            }

            insertText += text;

            // insert new type
            replaceStraight(this.getSourceFile(), insertPosition, replaceLength, insertText);

            return this;
        }
    };
}

function getSeparatorSyntaxKindForNode(node: Node) {
    switch (node.getKind()) {
        case ts.SyntaxKind.TypeAliasDeclaration:
            return ts.SyntaxKind.EqualsToken;
        default:
            return ts.SyntaxKind.ColonToken;
    }
}
