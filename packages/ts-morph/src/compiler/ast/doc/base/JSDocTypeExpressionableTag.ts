import { errors, ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { Node } from "../../common";
import { JSDocTag } from "../JSDocTag";
import { JSDocTypeExpression } from "../JSDocTypeExpression";

export type JSDocTypeExpressionableTagExtensionType = Node<ts.Node & { typeExpression: ts.JSDocTypeExpression | undefined }> & JSDocTag;

export interface JSDocTypeExpressionableTag {
  /**
   * Gets the type expression node of the JS doc tag if it exists.
   */
  getTypeExpression(): JSDocTypeExpression | undefined;

  /**
   * Gets the type expression node of the JS doc tag or throws if it doesn't exist.
   */
  getTypeExpressionOrThrow(message?: string | (() => string)): JSDocTypeExpression;
}

export function JSDocTypeExpressionableTag<T extends Constructor<JSDocTypeExpressionableTagExtensionType>>(Base: T):
  & Constructor<JSDocTypeExpressionableTag>
  & T
{
  return class extends Base implements JSDocTypeExpressionableTag {
    getTypeExpression() {
      const result = this._getNodeFromCompilerNodeIfExists(this.compilerNode.typeExpression);
      // temporary until https://github.com/microsoft/TypeScript/issues/36693 is fixed
      if (result != null && result.getWidth() === 0)
        return undefined;
      return result;
    }

    getTypeExpressionOrThrow(message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(this.getTypeExpression(), message || `Expected to find the JS doc tag's type expression.`, this);
    }
  };
}
