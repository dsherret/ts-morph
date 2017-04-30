import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {Type} from "./../type/Type";
import {TypeNode} from "./../type/TypeNode";
import {TypeChecker} from "./../tools";

export type TypedNodeExtensionType = Node<ts.Node & { type?: ts.TypeNode; }>;

export interface TypedNode {
    getType(typeChecker?: TypeChecker): Type;
    getTypeNode(): TypeNode | undefined;
    setType(text: string, sourceFile?: SourceFile): this;
}

export function TypedNode<T extends Constructor<TypedNodeExtensionType>>(Base: T): Constructor<TypedNode> & T {
    return class extends Base implements TypedNode {
        /**
         * Gets the type.
         * @typeChecker - Optional type checker.
         */
        getType(typeChecker: TypeChecker = this.factory.getTypeChecker()) {
            return typeChecker.getTypeAtLocation(this);
        }

        /**
         * Gets the type node or undefined if none exists.
         */
        getTypeNode() {
            return this.node.type == null ? undefined : this.factory.getTypeNode(this.node.type);
        }

        /**
         * Sets the type.
         * @param text - Text to set the type to.
         * @param sourceFile - Optional source file to help improve performance.
         */
        setType(text: string, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            // remove previous type
            const separatorSyntaxKind = getSeparatorSyntaxKindForNode(this);
            const separatorNode = this.getFirstChildByKind(separatorSyntaxKind);
            const typeNode = this.getTypeNode();
            sourceFile.removeNodes(separatorNode, typeNode);

            // insert new type
            const insertPosition = getTypeInsertPositionForNode(this, sourceFile);
            const separatorText = separatorSyntaxKind === ts.SyntaxKind.EqualsToken ? " =" : ":";
            sourceFile.insertText(insertPosition, separatorText + " " + text);

            return this;
        }
    };
}

function getTypeInsertPositionForNode(node: Node, sourceFile: SourceFile) {
    if (node.isInitializerExpressionableNode()) {
        const initializer = node.getInitializer();
        if (initializer != null) {
            const equalsToken = initializer.getPreviousSibling();
            /* istanbul ignore if */
            if (equalsToken == null || equalsToken.getKind() !== ts.SyntaxKind.EqualsToken)
                throw new errors.NotImplementedError("Not implemented scenario where the initializer doesn't have an equals token preceeding it.");
            return equalsToken.getPos();
        }
    }

    const lastToken = node.getLastToken(sourceFile);
    if (lastToken.getKind() === ts.SyntaxKind.SemicolonToken)
        return lastToken.getStart();

    return node.getEnd();
}

function getSeparatorSyntaxKindForNode(node: Node) {
    switch (node.getKind()) {
        case ts.SyntaxKind.TypeAliasDeclaration:
            return ts.SyntaxKind.EqualsToken;
        default:
            return ts.SyntaxKind.ColonToken;
    }
}
