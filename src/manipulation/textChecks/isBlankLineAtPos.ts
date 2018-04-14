import { SourceFile } from "../../compiler";

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
