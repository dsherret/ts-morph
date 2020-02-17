import { ts } from "@ts-morph/common";
import { ImplementationLocation } from "../../tools";
import { ReferenceFindableNode, RenameableNode } from "../base";
import { PrimaryExpression } from "../expression/PrimaryExpression";
import { CommonIdentifierBase } from "./base";

export const IdentifierBase = CommonIdentifierBase(ReferenceFindableNode(RenameableNode(PrimaryExpression)));
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
