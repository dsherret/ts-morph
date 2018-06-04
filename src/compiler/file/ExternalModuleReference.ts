import * as errors from "../../errors";
import { ts } from "../../typescript";
import { ModuleUtils, TypeGuards } from "../../utils";
import { Node } from "../common";
import { Expression } from "../expression";

export class ExternalModuleReference extends Node<ts.ExternalModuleReference> {
    /**
     * Gets the expression or undefined of the yield expression.
     */
    getExpression(): Expression | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.expression);
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
     * Gets if the external module reference is relative.
     */
    isRelative() {
        const expression = this.getExpression();
        if (expression == null || !TypeGuards.isStringLiteral(expression))
            return false;
        return ModuleUtils.isModuleSpecifierRelative(expression.getLiteralText());
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
        return ModuleUtils.getReferencedSourceFileFromSymbol(symbol);
    }
}
