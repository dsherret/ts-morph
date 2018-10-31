import { removeStatementedNodeChild } from "../../../manipulation";
import { ts } from "../../../typescript";
import { Node } from "../common";
import { SourceFile } from "../module";

export class Statement<T extends ts.Statement = ts.Statement> extends Node<T> {
    /**
     * Removes the statement.
     */
    remove() {
        removeStatementedNodeChild(this);
    }

    /**
     * Will move the statement to a new file updating all the references in the project.
     *
     * If `nodeFilePath` is not provided then the name of the new file will be the one of the first symbol
     * found or `newFile` if none is found.
     *
     * WARNING! This will forget all the nodes in this node's file! It's best to do this after you're all done with the file.
     *
     * @returns the new SourceFile to which the statement was moved or undefined if the statement coulnd't be moved.
     */
    moveToNewFile(newFilePath?: string): SourceFile | undefined {
        const edits = this.context.languageService.getEditsForRefactor(this.getSourceFile().getFilePath(), {},
            { pos: this.getStart(), end: this.getEnd() }, "Move to a new file", "Move to a new file", {});
        if (!edits || edits.getEdits().length < 2) {
            return;
        }
        const newFileName = newFilePath || edits.getEdits()[1].getFilePath();
        const newSourceFile = this.context.compilerFactory.createSourceFile(newFileName, "", {});
        newSourceFile.applyTextChanges(edits.getEdits()[1].getTextChanges());
        this.getSourceFile().applyTextChanges(edits.getEdits()[0].getTextChanges());
        return newSourceFile;
    }
}
