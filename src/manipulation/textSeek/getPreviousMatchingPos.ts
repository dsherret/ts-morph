// todo: tests
export function getPreviousMatchingPos(text: string, pos: number, condition: (char: string) => boolean) {
    while (pos > 0) {
        const char = text[pos - 1];
        if (!condition(char))
            pos--;
        else
            break;
    }

    return pos;
}
