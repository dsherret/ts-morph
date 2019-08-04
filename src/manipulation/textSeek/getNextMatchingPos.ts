// todo: tests
export function getNextMatchingPos(text: string, pos: number, condition: (char: string) => boolean) {
    while (pos < text.length) {
        const char = text[pos];
        if (!condition(char))
            pos++;
        else
            break;
    }

    return pos;
}
