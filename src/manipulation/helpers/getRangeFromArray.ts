import { Node } from "../../compiler";
import * as errors from "../../errors";
import { SyntaxKind } from "../../typescript";
import { getSyntaxKindName } from "../../utils";

export function getRangeFromArray<T extends Node>(array: Node[], index: number, length: number, expectedKind: SyntaxKind) {
    const children = array.slice(index, index + length);

    if (children.length !== length)
        throw new errors.NotImplementedError(`Unexpected! Inserted ${length} child/children, but ${children.length} were inserted.`);
    for (const child of children) {
        if (child.getKind() !== expectedKind)
            throw new errors.NotImplementedError(`Unexpected! Inserting syntax kind of ${getSyntaxKindName(expectedKind)}` +
                `, but ${child.getKindName()} was inserted.`);
    }

    return children as T[];
}
