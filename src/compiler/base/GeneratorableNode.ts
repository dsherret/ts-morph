import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertStraight} from "./../../manipulation";
import {Node} from "./../common";
import {SourceFile} from "./../file";

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
     * @param sourceFile - Optional source file to help improve performance.
     */
    setIsGenerator(value: boolean, sourceFile?: SourceFile): this;
}

export function GeneratorableNode<T extends Constructor<GeneratorableNodeExtensionType>>(Base: T): Constructor<GeneratorableNode> & T {
    return class extends Base implements GeneratorableNode {
        isGenerator() {
            return this.node.asteriskToken != null;
        }

        getAsteriskToken(): Node<ts.AsteriskToken> | undefined {
            const asteriskToken = this.node.asteriskToken;
            return asteriskToken == null ? undefined : (this.factory.getNodeFromCompilerNode(asteriskToken) as Node<ts.AsteriskToken>);
        }

        setIsGenerator(value: boolean, sourceFile?: SourceFile) {
            const asteriskToken = this.getAsteriskToken();
            const isSet = asteriskToken != null;

            if (isSet === value)
                return this;

            sourceFile = sourceFile || this.getRequiredSourceFile();

            if (asteriskToken != null) {
                sourceFile.removeNodesWithOptions([asteriskToken], {
                    removePrecedingSpaces: false
                });
            }
            else {
                const insertPos = getAsteriskInsertPosition(this, sourceFile);
                insertStraight(sourceFile, insertPos, "*");
            }

            return this;
        }
    };
}

function getAsteriskInsertPosition(node: Node, sourceFile: SourceFile) {
    if (node.getKind() === ts.SyntaxKind.FunctionDeclaration) {
        const funcKeyword = node.getFirstChildByKind(ts.SyntaxKind.FunctionKeyword);
        /* istanbul ignore if */
        if (funcKeyword == null)
            throw new errors.NotImplementedError("Expected a function keyword within the function declaration.");
        return funcKeyword.getEnd();
    }

    const nameNode = (node.node as any).name as ts.Node | undefined;
    /* istanbul ignore if */
    if (nameNode == null)
        throw new errors.NotImplementedError("Expected a name node for a non-function declaration.");

    return nameNode.getStart(sourceFile.getCompilerNode());
}
