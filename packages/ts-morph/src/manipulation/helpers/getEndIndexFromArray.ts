import { ts } from "@ts-morph/common";

/**
 * Gets the end index from a possibly undefined array.
 * @param array - Array that could possibly be undefined.
 */
export function getEndIndexFromArray(array: any[] | ts.NodeArray<any> | undefined) {
    return array?.length ?? 0;
}
