import { errors, ts } from "@ts-morph/common";
import { ModuleUtils } from "../../../utils";
import { Node } from "../common";
import { Expression, ExpressionableNode } from "../expression";

export const ExternalModuleReferenceBase = ExpressionableNode(Node);
export class ExternalModuleReference extends ExternalModuleReferenceBase<ts.ExternalModuleReference> {
  /**
   * Gets the source file referenced or throws if it can't find it.
   */
  getReferencedSourceFileOrThrow(message?: string | (() => string)) {
    return errors.throwIfNullOrUndefined(this.getReferencedSourceFile(), message || "Expected to find the referenced source file.", this);
  }

  /**
   * Gets if the external module reference is relative.
   */
  isRelative() {
    const expression = this.getExpression();
    if (expression == null || !Node.isStringLiteral(expression))
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
