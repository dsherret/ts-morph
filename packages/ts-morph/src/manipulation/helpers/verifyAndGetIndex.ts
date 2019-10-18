import { errors } from "@ts-morph/common";

/**
 * Verifies to see if an index or negative index exists within a specified length.
 * @param index - Index.
 * @param length - Length index could be in.
 */
export function verifyAndGetIndex(index: number, length: number) {
    const newIndex = index < 0 ? length + index : index;

    if (newIndex < 0)
        throw new errors.InvalidOperationError(`Invalid index: The max negative index is ${length * -1}, but ${index} was specified.`);
    if (index > length)
        throw new errors.InvalidOperationError(`Invalid index: The max index is ${length}, but ${index} was specified.`);

    return newIndex;
}
