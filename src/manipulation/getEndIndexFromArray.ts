/**
 * Gets the end index from a possibly undefined array.
 * @param array - Array that could possibly be undefined.
 */
export function getEndIndexFromArray(array: any[] | undefined) {
    return array == null ? 0 : array.length;
}
