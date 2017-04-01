import * as ts from "typescript";
import {Node} from "./../common";
import {Scope} from "./../common/Scope";
import {SourceFile} from "./../file";
import {ModifierableNode} from "./ModifierableNode";

export type ScopeableNodeExtensionType = Node<ts.Node> & ModifierableNode;

export interface ScopeableNode {
    getScope(): Scope | undefined;
    setScope(scope: Scope | undefined, sourceFile?: SourceFile): this;
}

export function ScopeableNode<T extends Constructor<ScopeableNodeExtensionType>>(Base: T): Constructor<ScopeableNode> & T {
    return class extends Base implements ScopeableNode {
        /**
         * Gets the scope.
         */
        getScope() {
            return getScopeForNode(this);
        }

        /**
         * Sets the scope.
         * @param scope - Scope to set to.
         * @param sourceFile - Optional source file to help improve performance.
         */
        setScope(scope: Scope | undefined, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            setScopeForNode(this, scope, sourceFile);
            return this;
        }
    };
}

/**
 * Gets the scope for a node.
 * @internal
 * @param node - Node to check for.
 */
export function getScopeForNode(node: Node<ts.Node>) {
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
 * @param sourceFile - Source file.
 */
export function setScopeForNode(node: Node<ts.Node> & ModifierableNode, scope: Scope | undefined, sourceFile: SourceFile) {
    node.toggleModifier("public", scope === Scope.Public, sourceFile); // always be implicit with scope
    node.toggleModifier("protected", scope === Scope.Protected, sourceFile);
    node.toggleModifier("private", scope === Scope.Private, sourceFile);
}
