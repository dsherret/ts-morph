import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {GeneratorableNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {insertIntoParent, removeChildrenWithFormatting, FormattingKind} from "./../../manipulation";
import {Node} from "./../common";
import {NamedNode} from "./../base";

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
     * Gets the asterisk token or throws if none exists.
     */
    getAsteriskTokenOrThrow(): Node<ts.AsteriskToken>;
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

        getAsteriskTokenOrThrow(): Node<ts.AsteriskToken> {
            return errors.throwIfNullOrUndefined(this.getAsteriskToken(), "Expected to find an asterisk token.");
        }

        setIsGenerator(value: boolean) {
            const asteriskToken = this.getAsteriskToken();
            const isSet = asteriskToken != null;

            if (isSet === value)
                return this;

            if (asteriskToken == null) {
                const info = getAsteriskInsertInfo(this);
                insertIntoParent({
                    insertPos: info.pos,
                    childIndex: info.childIndex,
                    insertItemsCount: 1,
                    parent: this,
                    newText: "*"
                });
            }
            else {
                removeChildrenWithFormatting({
                    children: [asteriskToken],
                    getSiblingFormatting: () => FormattingKind.Space
                });
            }

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

function getAsteriskInsertInfo(node: Node) {
    if (node.getKind() === ts.SyntaxKind.FunctionDeclaration) {
        const functionKeyword = node.getFirstChildByKindOrThrow(ts.SyntaxKind.FunctionKeyword);
        return {
            pos: functionKeyword.getEnd(),
            childIndex: functionKeyword.getChildIndex() + 1
        };
    }

    const namedNode = node as any as NamedNode;

    /* istanbul ignore if */
    if (namedNode.getName == null)
        throw new errors.NotImplementedError("Expected a name node for a non-function declaration.");

    const identifier = namedNode.getNameNode();
    return {
        pos: identifier.getStart(),
        childIndex: identifier.getChildIndex()
    };
}
