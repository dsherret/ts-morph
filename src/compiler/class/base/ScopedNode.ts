import * as ts from "typescript";
import {Node} from "./../../common";
import {Scope} from "./../Scope";
import {SourceFile} from "./../../file";
import {ModifierableNode} from "./../../base";

export type ScopedNodeExtensionType = Node<ts.Node> & ModifierableNode;

export interface ScopedNode {
    getScope(): Scope;
    setScope(scope: Scope, sourceFile?: SourceFile): this;
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

        /**
         * Sets the scope.
         * @param scope - Scope to set to.
         * @param sourceFile - Optional source file to help improve performance.
         */
        setScope(scope: Scope, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            this.toggleModifier("public", false, sourceFile); // always be implicit with scope
            this.toggleModifier("protected", scope === Scope.Protected, sourceFile);
            this.toggleModifier("private", scope === Scope.Private, sourceFile);
            return this;
        }
    };
}
