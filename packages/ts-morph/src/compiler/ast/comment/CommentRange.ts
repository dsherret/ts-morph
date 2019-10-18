import { ts } from "@ts-morph/common";
import { TextRange } from "../common/TextRange";
import { SourceFile } from "../module";

export class CommentRange extends TextRange<ts.CommentRange> {
    /**
     * @private
     */
    constructor(compilerObject: ts.CommentRange, sourceFile: SourceFile) {
        super(compilerObject, sourceFile);
    }

    /**
     * Gets the comment syntax kind.
     */
    getKind(): ts.CommentKind {
        return this.compilerObject.kind;
    }
}
