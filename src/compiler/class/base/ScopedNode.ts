import * as ts from "typescript";
import {Node} from "./../../common";
import {Scope} from "./../Scope";
import {ModifierableNode} from "./../../base";

export type ScopedNodeExtensionType = Node<ts.Node> & ModifierableNode;

export interface ScopedNode {
    getScope(): Scope;
}

export function ScopedNode<T extends Constructor<ScopedNodeExtensionType>>(Base: T): Constructor<ScopedNode> & T {
    return class extends Base implements ScopedNode {
        /**
         * Gets the scope.
         */
        getScope() {
            const modifierFlags = this.getCombinedModifierFlags();
            if ((modifierFlags & ts.ModifierFlags.Private) !== 0)
                return Scope.Private;
            else if ((modifierFlags & ts.ModifierFlags.Protected) !== 0)
                return Scope.Protected;
            else
                return Scope.Public;
        }
    };
}
