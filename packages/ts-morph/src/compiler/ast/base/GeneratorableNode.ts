import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { FormattingKind, insertIntoParentTextRange, removeChildrenWithFormatting } from "../../../manipulation";
import { GeneratorableNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { NamedNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";

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
            return this._getNodeFromCompilerNodeIfExists(this.compilerNode.asteriskToken);
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
                insertIntoParentTextRange({
                    insertPos: getAsteriskInsertPos(this),
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

        set(structure: Partial<GeneratorableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.isGenerator != null)
                this.setIsGenerator(structure.isGenerator);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<GeneratorableNodeStructure>(Base.prototype, this, {
                isGenerator: this.isGenerator()
            });
        }
    };
}

function getAsteriskInsertPos(node: Node) {
    if (node.getKind() === SyntaxKind.FunctionDeclaration)
        return node.getFirstChildByKindOrThrow(SyntaxKind.FunctionKeyword).getEnd();

    const namedNode = node as any as NamedNode;

    /* istanbul ignore if */
    if (namedNode.getName == null)
        throw new errors.NotImplementedError("Expected a name node for a non-function declaration.");

    return namedNode.getNameNode().getStart();
}
