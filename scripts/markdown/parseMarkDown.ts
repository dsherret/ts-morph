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
        let template: string;
        let codeBlockText: string;
        let position = i;
        const firstLineResult = getFirstLine();
        const isInline = firstLineResult == null;
        const blockText = getBlockText();

        codeBlocks.push(new CodeBlock(markDownFile, {
            codeType: firstLineResult == null || firstLineResult.codeType.length === 0 ? undefined : firstLineResult.codeType,
            firstLineOptions: firstLineResult == null || firstLineResult.template.length === 0 ? undefined : firstLineResult.template,
            inline: isInline,
            text: blockText,
            position
        }));

        function getFirstLine() {
            const originalPos = i + 1; // always move past first back tick
            let codeType: string | undefined;
            let template: string | undefined;

            if (isNewLine(-1) && isTripleBackTick()) {
                moveOffset(3); // move past triple back ticks
                codeType = getCodeType();
                moveWhile(isSpace);
                template = getTemplate();
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

            return { codeType, template };

            function getCodeType() {
                let result = "";
                while (isAlpha()) {
                    result += text[i];
                    i++;
                }
                return result;
            }

            function getTemplate() {
                let result = "";
                while (!isBackTick() && !isNewLine()) {
                    result += text[i];
                    i++;
                }
                return result.trim();
            }
        }

        function getBlockText() {
            let blockText = "";

            while (i < text.length) {
                if (isInline && isBackTick()) {
                    moveOffset(1);
                    return blockText;
                }
                else if (!isInline && isNewLine() && isTripleBackTickAtPos(posAfterNextNewLine())) {
                    i = posAfterNextNewLine() + 3; // move past triple back ticks
                    return blockText;
                }

                blockText += text[i];
                i++;
            }

            return blockText;
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
