import { ts } from "@ts-morph/common";
import { TypeNode } from "../type";

/**
 * JS doc type node.
 */
export class JSDocType<T extends ts.JSDocType = ts.JSDocType> extends TypeNode<T> {
}
