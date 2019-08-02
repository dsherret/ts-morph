import { getNextMatchingPos } from "./getNextMatchingPos";
import { getPreviousMatchingPos } from "./getPreviousMatchingPos";

export function getNextNonWhitespacePos(text: string, pos: number) {
    return getNextMatchingPos(text, pos, isNotWhitespace);
}

export function getPreviousNonWhitespacePos(text: string, pos: number) {
    return getPreviousMatchingPos(text, pos, isNotWhitespace);
}

function isNotWhitespace(char: string) {
    return char !== " " && char !== "\t" && char !== "\r" && char !== "\n";
}
