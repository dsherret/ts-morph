import { ts } from "@ts-morph/common";
import { CodeAction } from "./CodeAction";

/**
 * Represents a code fix action.
 *
 * A fix is a description and the edits that apply it. There is no fix name, fix
 * id or fix-all description: the compiler does not group fixes into fix-alls,
 * so there is no id to report or to feed back in.
 */
export class CodeFixAction extends CodeAction<ts.CodeFixAction> {
}
