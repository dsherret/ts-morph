import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertStraight, removeNodes} from "./../../manipulation";
import {Node} from "./../common";

export type GeneratorableNodeExtensionType = Node<ts.Node & { asteriskToken?: ts.AsteriskToken; }>;

export interface GeneratorableNode {
    /**
     * If it's a generator function.
     */
    isGenerator(): boolean;
    /**
     * Gets the asterisk token or undefined if none exists.
     */
    getAsteriskToken(): Node<ts.AsteriskToken> | undefined;
    /**
     * Sets if the node is a generator.
     * @param value - If it should be a generator or not.
     */
    setIsGenerator(value: boolean): this;
}

export function GeneratorableNode<T extends Constructor<GeneratorableNodeExtensionType>>(Base: T): Constructor<GeneratorableNode> & T {
    return class extends Base implements GeneratorableNode {
        isGenerator() {
            return this.node.asteriskToken != null;
        }

        getAsteriskToken(): Node<ts.AsteriskToken> | undefined {
            const asteriskToken = this.node.asteriskToken;
            return asteriskToken == null ? undefined : (this.factory.getNodeFromCompilerNode(asteriskToken, this.sourceFile) as Node<ts.AsteriskToken>);
        }

        setIsGenerator(value: boolean) {
            const asteriskToken = this.getAsteriskToken();
            const isSet = asteriskToken != null;

            if (isSet === value)
                return this;

            if (asteriskToken != null)
                removeNodes(this.getSourceFile(), [asteriskToken], { removePrecedingSpaces: false });
            else
                insertStraight(this.getSourceFile(), getAsteriskInsertPosition(this), this, "*");

            return this;
        }
    };
}

function getAsteriskInsertPosition(node: Node) {
    if (node.getKind() === ts.SyntaxKind.FunctionDeclaration) {
        return node.getFirstChildByKindOrThrow(ts.SyntaxKind.FunctionKeyword).getEnd();
    }

    const nameNode = (node.node as any).name as ts.Node | undefined;
    /* istanbul ignore if */
    if (nameNode == null)
        throw new errors.NotImplementedError("Expected a name node for a non-function declaration.");

    return nameNode.getStart(node.sourceFile.getCompilerNode());
}
