import { StringUtils } from "@ts-morph/common";

export function getTextWithoutStars(inputText: string) {
    const innerTextWithStars = inputText.replace(/^\/\*\*[^\S\n]*\n?/, "").replace(/(\r?\n)?[^\S\n]*\*\/$/, "");

    return innerTextWithStars.split(/\n/).map(line => {
        const starPos = getStarPosIfFirstNonWhitespaceChar(line);
        if (starPos === -1)
            return line;
        const substringStart = line[starPos + 1] === " " ? starPos + 2 : starPos + 1;
        return line.substring(substringStart);
    }).join("\n");

    function getStarPosIfFirstNonWhitespaceChar(text: string) {
        const asteriskCharCode = "*".charCodeAt(0);
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            if (charCode === asteriskCharCode)
                return i;
            else if (!StringUtils.isWhitespaceCharCode(charCode))
                break;
        }

        return -1;
    }
}
