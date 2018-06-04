import { ScopedNodeStructure } from "../../structures";
import { Constructor } from "../../types";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { Scope } from "../common/Scope";
import { ModifierableNode } from "./ModifierableNode";
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

        fill(structure: Partial<ScopedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.scope != null)
                this.setScope(structure.scope);

            return this;
        }
    };
}
