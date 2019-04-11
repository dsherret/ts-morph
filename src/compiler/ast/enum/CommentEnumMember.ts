import { removeChildrenWithFormatting, FormattingKind } from "../../../manipulation";
import { CompilerCommentEnumMember } from "../comment";
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
