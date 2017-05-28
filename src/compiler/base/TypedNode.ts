import * as ts from "typescript";
import * as errors from "./../../errors";
import {replaceStraight} from "./../../manipulation";
import {Node} from "./../common";
import {SourceFile} from "./../file";
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
     * @param sourceFile - Optional source file to help improve performance.
     */
    setType(text: string, sourceFile?: SourceFile): this;
}

export function TypedNode<T extends Constructor<TypedNodeExtensionType>>(Base: T): Constructor<TypedNode> & T {
    return class extends Base implements TypedNode {
        getType() {
            return this.factory.getTypeChecker().getTypeAtLocation(this);
        }

        getTypeNode() {
            return this.node.type == null ? undefined : this.factory.getTypeNode(this.node.type);
        }

        setType(text: string, sourceFile: SourceFile = this.getSourceFileOrThrow()) {
            // remove previous type
            const separatorSyntaxKind = getSeparatorSyntaxKindForNode(this);
            const separatorNode = this.getFirstChildByKind(separatorSyntaxKind, sourceFile);
            const typeNode = this.getTypeNode();
            const replaceLength = typeNode == null ? 0 : typeNode.getWidth();

            let insertPosition: number;
            let insertText = "";

            if (separatorNode == null)
                insertText += separatorSyntaxKind === ts.SyntaxKind.EqualsToken ? " = " : ": ";

            if (typeNode == null) {
                const identifier = this.getFirstChildByKind(ts.SyntaxKind.Identifier, sourceFile);
                /* istanbul ignore if */
                if (identifier == null)
                    throw new errors.NotImplementedError("Unexpected: Could not find identifier.");
                insertPosition = identifier.getEnd();
            }
            else {
                insertPosition = typeNode.getStart();
            }

            insertText += text;

            // insert new type
            replaceStraight(sourceFile, insertPosition, replaceLength, insertText);

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
