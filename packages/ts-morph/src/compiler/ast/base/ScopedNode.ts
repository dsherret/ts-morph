import { ScopedNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { Scope } from "../common/Scope";
import { ModifierableNode } from "./ModifierableNode";
import * as scopeableNode from "./ScopeableNode";
import { callBaseGetStructure } from "../callBaseGetStructure";

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
    setScope(scope: Scope | undefined): this;
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

        setScope(scope: Scope | undefined) {
            scopeableNode.setScopeForNode(this, scope);
            return this;
        }

        hasScopeKeyword() {
            return scopeableNode.getScopeForNode(this) != null;
        }

        set(structure: Partial<ScopedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.hasOwnProperty(nameof(structure.scope)))
                this.setScope(structure.scope);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<ScopedNodeStructure>(Base.prototype, this, {
                scope: this.hasScopeKeyword() ? this.getScope() : undefined
            });
        }
    };
}
