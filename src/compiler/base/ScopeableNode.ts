import { ScopeableNodeStructure } from "../../structures";
import { Constructor } from "../../types";
import { ts } from "../../typescript";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { Scope } from "../common/Scope";
import { ModifierableNode } from "./ModifierableNode";

export type ScopeableNodeExtensionType = Node & ModifierableNode;

export interface ScopeableNode {
    /**
     * Gets the scope.
     * @skipOrThrowCheck
     */
    getScope(): Scope | undefined;
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

export function ScopeableNode<T extends Constructor<ScopeableNodeExtensionType>>(Base: T): Constructor<ScopeableNode> & T {
    return class extends Base implements ScopeableNode {
        getScope() {
            return getScopeForNode(this);
        }

        setScope(scope: Scope | undefined) {
            setScopeForNode(this, scope);
            return this;
        }

        hasScopeKeyword() {
            return this.getScope() != null;
        }

        fill(structure: Partial<ScopeableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.scope != null)
                this.setScope(structure.scope);

            return this;
        }
    };
}

/**
 * Gets the scope for a node.
 * @internal
 * @param node - Node to check for.
 */
export function getScopeForNode(node: Node) {
    const modifierFlags = node.getCombinedModifierFlags();
    if ((modifierFlags & ts.ModifierFlags.Private) !== 0)
        return Scope.Private;
    else if ((modifierFlags & ts.ModifierFlags.Protected) !== 0)
        return Scope.Protected;
    else if ((modifierFlags & ts.ModifierFlags.Public) !== 0)
        return Scope.Public;
    else
        return undefined;
}

/**
 * Sets the scope for a node.
 * @internal
 * @param node - Node to set the scope for.
 * @param scope - Scope to be set to.
 */
export function setScopeForNode(node: Node & ModifierableNode, scope: Scope | undefined) {
    node.toggleModifier("public", scope === Scope.Public); // always be explicit with scope
    node.toggleModifier("protected", scope === Scope.Protected);
    node.toggleModifier("private", scope === Scope.Private);
}
