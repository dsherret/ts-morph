import { CompilerCommentEnumMember } from "@ts-morph/comment-parser";
import { removeChildrenWithFormatting, FormattingKind } from "../../../manipulation";
import { Node } from "../common";

export class CommentEnumMember extends Node<CompilerCommentEnumMember> {
    /**
     * Removes this enum member comment.
     */
    remove() {
        removeChildrenWithFormatting({
            children: [this],
            getSiblingFormatting: () => FormattingKind.Newline
        });
    }
}
