import * as errors from "../../../errors";
import { Constructor } from "../../../types";
import { SyntaxKind, ts } from "../../../typescript";
import { getSyntaxKindName } from "../../../utils";
import { Node } from "../../common";
import { Expression } from "../../expression";
import { KindToExpressionMappings } from "../../kindToNodeMappings";

export type InitializerGetExpressionableExtensionType = Node<ts.Node & { initializer?: ts.Expression; }>;

export interface InitializerGetExpressionableNode {
    /**
     * Gets if node has an initializer.
     */
    hasInitializer(): boolean;
    /**
     * Gets the initializer.
     */
    getInitializer(): Expression | undefined;
    /**
     * Gets the initializer if it's a certain kind or throws.
     */
    getInitializerIfKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind];
    /**
     * Gets the initializer if it's a certain kind.
     */
    getInitializerIfKind<TKind extends SyntaxKind>(kind: TKind): KindToExpressionMappings[TKind] | undefined;
    /**
     * Gets the initializer or throw.
     */
    getInitializerOrThrow(): Expression;
}

export function InitializerGetExpressionableNode<T extends Constructor<InitializerGetExpressionableExtensionType>>(Base: T): Constructor<InitializerGetExpressionableNode> & T {
    return class extends Base implements InitializerGetExpressionableNode {
        hasInitializer() {
            return this.compilerNode.initializer != null;
        }

        getInitializerIfKindOrThrow(kind: SyntaxKind) {
            return errors.throwIfNullOrUndefined(this.getInitializerIfKind(kind), `Expected to find an initiailizer of kind '${getSyntaxKindName(kind)}'.`);
        }

        getInitializerIfKind(kind: SyntaxKind) {
            const initiailizer = this.getInitializer();
            if (initiailizer != null && initiailizer.getKind() !== kind)
                return undefined;
            return initiailizer;
        }

        getInitializerOrThrow() {
            return errors.throwIfNullOrUndefined(this.getInitializer(), "Expected to find an initializer.");
        }

        getInitializer() {
            return this.getNodeFromCompilerNodeIfExists(this.compilerNode.initializer);
        }
    };
}
