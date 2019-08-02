/* barrel:ignore */
import { CodeBlock } from "./CodeBlock";
import { MarkDownFile } from "./MarkDownFile";

export function parseMarkDown(markDownFile: MarkDownFile) {
    // simple markdown parser based on some assumptions
    const chars = {
        LineFeed: "\n",
        CarriageReturn: "\r",
        BackTick: "`"
    };
    const codeBlocks: CodeBlock[] = [];
    const isAlphaTest = /^[A-Z]+$/i;
    const isSpaceOrTabTest = /^( |\t)+$/i;
    const text = markDownFile.getText();
    let i: number;

    for (i = 0; i < text.length; i++) {
        if (isBackTick())
            parseCodeBlock();
    }

    return codeBlocks;

    function parseCodeBlock() {
        const position = i;
        const firstLineResult = getFirstLine();
        const isInline = firstLineResult == null;
        const blockText = getBlockText();

        codeBlocks.push(new CodeBlock(markDownFile, {
            codeType: firstLineResult == null || firstLineResult.codeType.length === 0 ? undefined : firstLineResult.codeType,
            firstLineOptions: firstLineResult == null || firstLineResult.options.length === 0 ? undefined : firstLineResult.options,
            inline: isInline,
            text: blockText,
            position
        }));

        function getFirstLine() {
            const originalPos = i + 1; // always move past first back tick
            let codeType: string | undefined;
            let options: string | undefined;

            if (isNewLine(-1) && isTripleBackTick()) {
                moveOffset(3); // move past triple back ticks
                codeType = getCodeType();
                moveWhile(isSpace);
                options = getOptionsText();
            }
            else {
                i = originalPos;
                return undefined;
            }

            if (isBackTick()) {
                i = originalPos;
                return undefined;
            }
            if (!isNewLine())
                throw new Error(`Unhandled char on first line of code block: ${text[i]}`);
            i = posAfterNextNewLine();

            return { codeType, options };

            function getCodeType() {
                let result = "";
                while (isAlpha()) {
                    result += text[i];
                    i++;
                }
                return result;
            }

            function getOptionsText() {
                let result = "";
                while (!isBackTick() && !isNewLine()) {
                    result += text[i];
                    i++;
                }
                return result.trim();
            }
        }

        function getBlockText() {
            let result = "";

            while (i < text.length) {
                if (isInline && isBackTick()) {
                    moveOffset(1);
                    return result;
                }
                else if (!isInline && isNewLine() && isTripleBackTickAtPos(posAfterNextNewLine())) {
                    i = posAfterNextNewLine() + 3; // move past triple back ticks
                    return result;
                }

                result += text[i];
                i++;
            }

            return result;
        }
    }

    function isTripleBackTick(offset = 0) {
        return isTripleBackTickAtPos(i + offset);
    }

    function isTripleBackTickAtPos(pos: number) {
        return isBackTickAtPos(pos) && isBackTickAtPos(pos + 1) && isBackTickAtPos(pos + 2);
    }

    function isNewLine(offset = 0) {
        return isNewLineAtPos(i + offset);
    }

    function isNewLineAtPos(pos: number) {
        return text[pos] === chars.LineFeed || (text[pos] === chars.CarriageReturn && text[pos + 1] === chars.LineFeed);
    }

    function posAfterNextNewLine() {
        for (let newPos = i; newPos < text.length; newPos++) {
            if (isNewLineAtPos(newPos))
                return isNewLineAtPos(newPos + 1) ? newPos + 2 : newPos + 1;
        }
        return text.length;
    }

    function isBackTick(offset = 0) {
        return isBackTickAtPos(i + offset);
    }

    function isBackTickAtPos(pos: number) {
        return text[pos] === chars.BackTick;
    }

    function isSpace(offset = 0) {
        return isSpaceOrTabTest.test(text[i + offset]);
    }

    function isAlpha(offset = 0) {
        return isAlphaTest.test(text[i + offset]);
    }

    function moveWhile(func: () => boolean) {
        while (func())
            i++;
    }

    function moveOffset(offset: number) {
        i += offset;
    }
}
