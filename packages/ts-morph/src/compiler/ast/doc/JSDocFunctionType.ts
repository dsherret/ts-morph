import { ts } from "@ts-morph/common";
import { SignaturedDeclaration } from "../base";
import { JSDocType } from "./JSDocType";

export const JSDocFunctionTypeBase = SignaturedDeclaration(JSDocType);

/**
 * JS doc function type.
 */
export class JSDocFunctionType extends JSDocFunctionTypeBase<ts.JSDocFunctionType> {
}
