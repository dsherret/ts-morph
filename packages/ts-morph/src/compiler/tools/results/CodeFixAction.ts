import { ts } from "@ts-morph/common";
import { CodeAction } from "./CodeAction";

/**
 * Represents a code fix action.
 *
 * Breaking change: `getFixName()`, `getFixId()` and `getFixAllDescription()` are
 * gone. tsgo returns a description and the edits, and does not group fixes into
 * fix-alls, so there is no id to report or to feed back in.
 */
export class CodeFixAction extends CodeAction<ts.CodeFixAction> {
}
