import { ArrayUtils, ts } from "@ts-morph/common";
import { ScopeableNodeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { Scope } from "../common/Scope";
import { ModifierableNode } from "./ModifierableNode";
import { callBaseGetStructure } from "../callBaseGetStructure";

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
            const scope = getScopeForNode(this);
            if (scope != null)
                return scope;
            if (Node.isParameterDeclaration(this) && this.isReadonly())
                return Scope.Public;
            return undefined;
        }

        setScope(scope: Scope | undefined) {
            setScopeForNode(this, scope);
            return this;
        }

        // todo: make public
        private getScopeKeyword() {
            return this.getModifiers().find(m => {
                const text = m.getText();
                return text === "public" || text === "protected" || text === "private";
            });
        }

        hasScopeKeyword() {
            return this.getScopeKeyword() != null;
        }

        set(structure: Partial<ScopeableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.hasOwnProperty(nameof(structure.scope)))
                this.setScope(structure.scope);

            return this;
        }

        getStructure() {
            return callBaseGetStructure<ScopeableNodeStructure>(Base.prototype, this, {
                scope: this.getScope()
            });
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
