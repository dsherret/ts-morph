import { SyntaxKind, ts } from "../../../typescript";
import { AsyncableNode, BodiedNode, TextInsertableNode } from "../base";
import { Node } from "../common";
import { Expression } from "../expression";
import { FunctionLikeDeclaration } from "./FunctionLikeDeclaration";

export const ArrowFunctionBase = TextInsertableNode(BodiedNode(AsyncableNode(FunctionLikeDeclaration(Expression))));
export class ArrowFunction extends ArrowFunctionBase<ts.ArrowFunction> {
    /**
     * Gets the equals greater than token of the arrow function.
     */
    getEqualsGreaterThan(): Node<ts.Token<SyntaxKind.EqualsGreaterThanToken>> {
        return this.getNodeFromCompilerNode(this.compilerNode.equalsGreaterThanToken);
    }

    /**
     * Add braces to this arrow function body in case is viable.
     *
     * WARNING! This will forget all the nodes in the file! It's best to do this after you're all done with the file.
     */
    addBracesToBody() {
        const edits = this.context.languageService.getEditsForRefactor(this.getSourceFile().getFilePath(), {},
            { pos: this.getStart(), end: this.getEnd() }, "Add or remove braces in an arrow function",
            "Add braces to arrow function", {});
        if (edits && edits.getEdits().length)
            this.getSourceFile().applyTextChanges(edits!.getEdits()[0].getTextChanges());
    }

    /**
     * Remove braces to this arrow function body in case is viable.
     *
     * WARNING! This will forget all the nodes in the file! It's best to do this after you're all done with the file.
     */
    removeBracesFromBody() {
        const edits = this.context.languageService.getEditsForRefactor(this.getSourceFile().getFilePath(), {},
            { pos: this.getStart(), end: this.getEnd() }, "Add or remove braces in an arrow function",
            "Remove braces from arrow function", {});
        if (edits && edits.getEdits().length)
            this.getSourceFile().applyTextChanges(edits!.getEdits()[0].getTextChanges());
    }
}
