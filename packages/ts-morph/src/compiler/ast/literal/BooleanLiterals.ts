import { SyntaxKind, ts } from "@ts-morph/common";
import { PrimaryExpression } from "../expression";

export const TrueLiteralBase = PrimaryExpression;
export class TrueLiteral extends TrueLiteralBase<ts.TrueLiteral> {
  /**
   * Gets the literal value.
   */
  getLiteralValue(): boolean {
    return getLiteralValue(this);
  }

  /**
   * Sets the literal value.
   *
   * Note: This forgets the current node and returns the new node if the value changes.
   * @param value - Value to set.
   */
  setLiteralValue(value: boolean): this | FalseLiteral {
    return setLiteralValue(this, value) as this | FalseLiteral;
  }
}

export const FalseLiteralBase = PrimaryExpression;
export class FalseLiteral extends FalseLiteralBase<ts.FalseLiteral> {
  /**
   * Gets the literal value.
   */
  getLiteralValue(): boolean {
    return getLiteralValue(this);
  }

  /**
   * Sets the literal value.
   *
   * Note: This forgets the current node and returns the new node if the value changes.
   * @param value - Value to set.
   */
  setLiteralValue(value: boolean): this | TrueLiteral {
    return setLiteralValue(this, value) as this | TrueLiteral;
  }
}

function setLiteralValue(node: TrueLiteral | FalseLiteral, value: boolean) {
  if (getLiteralValue(node) === value)
    return node;

  // todo: make this not forget the current node
  const parent = node.getParentSyntaxList() || node.getParentOrThrow();
  const index = node.getChildIndex();
  node.replaceWithText(value ? "true" : "false");
  return parent.getChildAtIndex(index) as TrueLiteral | FalseLiteral;
}

function getLiteralValue(node: TrueLiteral | FalseLiteral) {
  return node.getKind() === SyntaxKind.TrueKeyword;
}
