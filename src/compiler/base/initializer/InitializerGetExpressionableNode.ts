import * as ts from "typescript";
import {Constructor} from "./../../../Constructor";
import * as errors from "./../../../errors";
import {Expression} from "./../../expression";
import {Node} from "./../../common";

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
    getInitializerIfKindOrThrow(kind: ts.SyntaxKind): Expression;
    /**
     * Gets the initializer if it's a certain kind.
     */
    getInitializerIfKind(kind: ts.SyntaxKind): Expression | undefined;
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

        getInitializerIfKindOrThrow(kind: ts.SyntaxKind) {
            return errors.throwIfNullOrUndefined(this.getInitializerIfKind(kind), `Expected to find an initiailizer of kind '${ts.SyntaxKind[kind]}'.`);
        }

        getInitializerIfKind(kind: ts.SyntaxKind) {
            const initiailizer = this.getInitializer();
            if (initiailizer != null && initiailizer.getKind() !== kind)
                return undefined;
            return initiailizer;
        }

        getInitializerOrThrow() {
            return errors.throwIfNullOrUndefined(this.getInitializer(), "Expected to find an initializer.");
        }

        getInitializer() {
            return this.getNodeFromCompilerNodeIfExists<Expression>(this.compilerNode.initializer);
        }
    };
}
