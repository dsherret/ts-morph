import {Constructor} from "./../../Constructor";
import {Node} from "./../common";
import {Scope} from "./../common/Scope";
import {ModifierableNode} from "./ModifierableNode";
import * as scopeableNode from "./ScopeableNode";

export type ScopedNodeExtensionType = Node & ModifierableNode;

export interface ScopedNode {
    /**
     * Gets the scope.
     */
    getScope(): Scope;
    /**
     * Sets the scope.
     * @param scope - Scope to set to.
     */
    setScope(scope: Scope): this;
    /**
     * Gets if the node has a scope keyword.
     */
    hasScopeKeyword(): boolean;
}

export function ScopedNode<T extends Constructor<ScopedNodeExtensionType>>(Base: T): Constructor<ScopedNode> & T {
    return class extends Base implements ScopedNode {
        getScope() {
            return scopeableNode.getScopeForNode(this) || Scope.Public;
        }

        setScope(scope: Scope) {
            scopeableNode.setScopeForNode(this, scope === Scope.Public ? undefined : scope);
            return this;
        }

        hasScopeKeyword() {
            return scopeableNode.getScopeForNode(this) != null;
        }
    };
}
