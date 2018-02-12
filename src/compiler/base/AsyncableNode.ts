import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {AsyncableNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {ts, SyntaxKind} from "./../../typescript";
import {ModifierableNode} from "./ModifierableNode";

export type AsyncableNodeExtensionType = Node & ModifierableNode;

export interface AsyncableNode {
    /**
     * If it's async.
     */
    isAsync(): boolean;
    /**
     * Gets the async keyword or undefined if none exists.
     */
    getAsyncKeyword(): Node<ts.Modifier> | undefined;
    /**
     * Gets the async keyword or throws if none exists.
     */
    getAsyncKeywordOrThrow(): Node<ts.Modifier>;
    /**
     * Sets if the node is async.
     * @param value - If it should be async or not.
     */
    setIsAsync(value: boolean): this;
}

export function AsyncableNode<T extends Constructor<AsyncableNodeExtensionType>>(Base: T): Constructor<AsyncableNode> & T {
    return class extends Base implements AsyncableNode {
        isAsync() {
            return this.hasModifier(SyntaxKind.AsyncKeyword);
        }

        getAsyncKeyword(): Node<ts.Modifier> | undefined {
            return this.getFirstModifierByKind(SyntaxKind.AsyncKeyword);
        }

        getAsyncKeywordOrThrow(): Node<ts.Modifier> {
            return errors.throwIfNullOrUndefined(this.getFirstModifierByKind(SyntaxKind.AsyncKeyword), "Expected to find an async keyword.");
        }

        setIsAsync(value: boolean) {
            this.toggleModifier("async", value);
            return this;
        }

        fill(structure: Partial<AsyncableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.isAsync != null)
                this.setIsAsync(structure.isAsync);

            return this;
        }
    };
}
