import { getNextMatchingPos } from "./getNextMatchingPos";

export function getNextNonWhitespacePos(text: string, pos: number) {
    return getNextMatchingPos(text, pos, char => char !== " " && char !== "\t" && char !== "\r" && char !== "\n");
}
