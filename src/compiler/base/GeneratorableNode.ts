import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {GeneratorableNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
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
            return this.compilerNode.asteriskToken != null;
        }

        getAsteriskToken(): Node<ts.AsteriskToken> | undefined {
            const asteriskToken = this.compilerNode.asteriskToken;
            return asteriskToken == null ? undefined : (this.global.compilerFactory.getNodeFromCompilerNode(asteriskToken, this.sourceFile) as Node<ts.AsteriskToken>);
        }

        setIsGenerator(value: boolean) {
            const asteriskToken = this.getAsteriskToken();
            const isSet = asteriskToken != null;

            if (isSet === value)
                return this;

            if (asteriskToken != null)
                removeNodes([asteriskToken], { removePrecedingSpaces: false });
            else
                insertStraight({
                    insertPos: getAsteriskInsertPosition(this),
                    parent: this,
                    newCode: "*"
                });

            return this;
        }

        fill(structure: Partial<GeneratorableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.isGenerator != null)
                this.setIsGenerator(structure.isGenerator);

            return this;
        }
    };
}

function getAsteriskInsertPosition(node: Node) {
    if (node.getKind() === ts.SyntaxKind.FunctionDeclaration) {
        return node.getFirstChildByKindOrThrow(ts.SyntaxKind.FunctionKeyword).getEnd();
    }

    const nameNode = (node.compilerNode as any).name as ts.Node | undefined;
    /* istanbul ignore if */
    if (nameNode == null)
        throw new errors.NotImplementedError("Expected a name node for a non-function declaration.");

    return nameNode.getStart(node.sourceFile.compilerNode);
}
