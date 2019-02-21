import { ts } from "../../../typescript";
import { SignaturedDeclaration } from "../base";
import { JSDocType } from "./JSDocType";

export const JSDocFunctionTypeBase = SignaturedDeclaration(JSDocType);

/**
 * JS doc function type.
 */
export class JSDocFunctionType extends JSDocFunctionTypeBase<ts.JSDocFunctionType> {
}
