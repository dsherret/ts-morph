import {ts, SyntaxKind} from "./../../typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {Expression} from "./../expression";
import {SourceFile} from "./SourceFile";

export class ExternalModuleReference extends Node<ts.ExternalModuleReference> {
    /**
     * Gets the expression or undefined of the yield expression.
     */
    getExpression() {
        return this.getNodeFromCompilerNodeIfExists<Expression>(this.compilerNode.expression);
    }

    /**
     * Gets the expression of the yield expression or throws if it does not exist.
     */
    getExpressionOrThrow() {
        return errors.throwIfNullOrUndefined(this.getExpression(), "Expected to find an expression.");
    }

    /**
     * Gets the source file referenced or throws if it can't find it.
     */
    getReferencedSourceFileOrThrow() {
        return errors.throwIfNullOrUndefined(this.getReferencedSourceFile(), "Expected to find the referenced source file.");
    }

    /**
     * Gets the source file referenced or returns undefined if it can't find it.
     */
    getReferencedSourceFile() {
        const expression = this.getExpression();
        if (expression == null)
            return undefined;
        const symbol = expression.getSymbol();
        if (symbol == null)
            return undefined;
        const declarations = symbol.getDeclarations();
        if (declarations.length === 0 || declarations[0].getKind() !== SyntaxKind.SourceFile)
            return undefined;
        return declarations[0] as SourceFile;
    }
}
