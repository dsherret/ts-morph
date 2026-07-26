import { ts } from "@ts-morph/common";
import { ImplementationLocation } from "../../tools";
import { ReferenceFindableNode, RenameableNode } from "../base";
import { PrimaryExpression } from "../expression/PrimaryExpression";
import { CommonIdentifierBase } from "./base";

const createBase = <T extends typeof PrimaryExpression>(ctor: T) => CommonIdentifierBase(ReferenceFindableNode(RenameableNode(ctor)));
export const IdentifierBase = createBase(PrimaryExpression);
export class Identifier extends IdentifierBase<ts.Identifier> {
  /**
   * Gets the implementations of the identifier.
   *
   * This is similar to "go to implementation."
   */
  getImplementations(): ImplementationLocation[] {
    return this._context.languageService.getImplementations(this);
  }
}
