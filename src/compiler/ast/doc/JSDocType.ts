import { ts } from "../../../typescript";
import { TypeNode } from "../type";

/**
 * JS doc type node.
 */
export class JSDocType<T extends ts.JSDocType = ts.JSDocType> extends TypeNode<T> {
}
