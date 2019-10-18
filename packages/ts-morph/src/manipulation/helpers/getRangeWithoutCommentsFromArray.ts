import { errors, getSyntaxKindName, SyntaxKind } from "@ts-morph/common";
import { Node } from "../../compiler";

/**
 * Gets a range of the array.
 * @remarks NOTICE: This will ignore comments in the array.
 */
export function getRangeWithoutCommentsFromArray<T extends Node>(array: Node[], index: number, length: number, expectedKind: SyntaxKind) {
    const children: T[] = [];

    while (index < array.length && children.length < length) {
        const child = array[index];
        const childKind = child.getKind();

        // ignore any comments that may have been on the structure's leading trivia or trailing trivia
        if (childKind !== SyntaxKind.SingleLineCommentTrivia && childKind !== SyntaxKind.MultiLineCommentTrivia) {
            if (childKind !== expectedKind) {
                throw new errors.NotImplementedError(`Unexpected! Inserting syntax kind of ${getSyntaxKindName(expectedKind)}`
                    + `, but ${child.getKindName()} was inserted.`);
            }

            children.push(child as T);
        }

        index++;
    }

    if (children.length !== length)
        throw new errors.NotImplementedError(`Unexpected! Inserted ${length} child/children, but ${children.length} were inserted.`);

    return children as T[];
}
