import { MarkDownFile } from "./MarkDownFile";

export interface CodeBlockConstructorOptions {
    codeType: string | undefined;
    firstLineOptions: string | undefined;
    inline: boolean;
    text: string;
    position: number;
}

export class CodeBlock {
    constructor(public readonly markdownFile: MarkDownFile, private readonly opts: CodeBlockConstructorOptions) {
    }

    get inline() {
        return this.opts.inline;
    }

    get codeType() {
        return this.opts.codeType;
    }

    get text() {
        return this.opts.text;
    }

    getLineNumber() {
        return getLineNumberAtPos(this.markdownFile.getText(), this.opts.position);
    }

    getIgnoredErrorCodes() {
        const { firstLineOptions } = this.opts;
        const ignoreErrorPrefix = "ignore-error: ";
        if (firstLineOptions == null || !firstLineOptions.startsWith(ignoreErrorPrefix))
            return [];
        const searchString = firstLineOptions.substring(ignoreErrorPrefix.length);
        const result = /^([0-9],?( )*)+/.exec(searchString);
        if (result == null || result.length === 0)
            return [];
        return result[0].split(",").map(numStr => parseInt(numStr, 10));
    }

    getSetupText() {
        const { firstLineOptions } = this.opts;
        if (firstLineOptions == null)
            return "";
        const setupPrefix = "setup: ";
        const setupIndex = firstLineOptions.indexOf(setupPrefix);
        if (setupIndex === -1)
            return "";
        return firstLineOptions.substring(setupIndex + setupPrefix.length) + "\r\n";
    }
}

function getLineNumberAtPos(str: string, pos: number) {
    // do not allocate a string in this method
    let count = 0;

    for (let i = 0; i < pos; i++) {
        if (str[i] === "\n" || (str[i] === "\r" && str[i + 1] !== "\n"))
            count++;
    }

    return count + 1; // convert count to line number
}
