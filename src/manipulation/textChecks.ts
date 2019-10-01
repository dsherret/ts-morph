import { SourceFile } from "../compiler";

export function isBlankLineAtPos(sourceFile: SourceFile, pos: number) {
    const fullText = sourceFile.getFullText();
    let foundBlankLine = false;

    for (let i = pos; i < fullText.length; i++) {
        const char = fullText[i];

        if (char === " " || char === "\t")
            continue;
        if (char === "\r" && fullText[i + 1] === "\n" || char === "\n") {
            if (foundBlankLine)
                return true;
            foundBlankLine = true;

            if (char === "\r")
                i++;
            continue;
        }

        return false;
    }

    return false;
}

export function isNewLineAtPos(fullText: string, pos: number) {
    return fullText[pos] === "\n" || (fullText[pos] === "\r" && fullText[pos + 1] === "\n");
}

export function hasNewLineInRange(fullText: string, range: [number, number]) {
    for (let i = range[0]; i < range[1]; i++) {
        if (fullText[i] === "\n")
            return true;
    }
    return false;
}
