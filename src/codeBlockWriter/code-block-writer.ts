import ImportedCodeBlockWriter from "code-block-writer";

interface CodeBlockWriterOptions {
    newLine: string;
    indentNumberOfSpaces: number;
    useTabs: boolean;
    useSingleQuote: boolean;
}

declare class CodeBlockWriter {
    private _indentationText: any;
    private _newLine: any;
    private _useTabs: any;
    private _quoteChar: any;
    private _indentNumberOfSpaces: any;
    private _currentIndentation: any;
    private _queuedIndentation: any;
    private _text: any;
    private _newLineOnNextWrite: any;
    private _stringCharStack: any;
    private _isInRegEx: any;
    private _isOnFirstLineOfBlock: any;
    constructor(opts?: Partial<CodeBlockWriterOptions>);
    /**
     * Gets the options.
     */
    getOptions(): CodeBlockWriterOptions;
    /**
     * Queues the indentation level for the next lines written.
     * @param indentationLevel - Indentation level to be at.
     */
    queueIndentationLevel(indentationLevel: number): this;
    /**
     * Queues the indentation level for the next lines written using the provided indentation text.
     * @param indentationText - Gets the indentation level from the indentation text.
     */
    queueIndentationLevel(indentationText: string): this;
    /**
     * Sets the current indentation level.
     * @param indentationLevel - Indentation level to be at.
     */
    setIndentationLevel(indentationLevel: number): this;
    /**
     * Sets the current indentation using the provided indentation text.
     * @param indentationText - Gets the indentation level from the indentation text.
     */
    setIndentationLevel(indentationText: string): this;
    /**
     * Gets the current indentation level.
     */
    getIndentationLevel(): number;
    /**
     * Writes a block using braces.
     * @param block - Write using the writer within this block.
     */
    block(block?: () => void): this;
    /**
     * Writes an inline block with braces.
     * @param block - Write using the writer within this block.
     */
    inlineBlock(block?: () => void): this;
    /**
     * Indents a block of code.
     * @param block - Block to indent.
     */
    indentBlock(block: () => void): this;
    private _indentBlockInternal(block?: any);
    /**
     * Conditionally writes a line of text.
     * @param condition - Condition to evaluate.
     * @param textFunc - A function that returns a string to write if the condition is true.
     */
    conditionalWriteLine(condition: boolean | undefined, textFunc: () => string): this;
    /**
     * Conditionally writes a line of text.
     * @param condition - Condition to evaluate.
     * @param text - Text to write if the condition is true.
     */
    conditionalWriteLine(condition: boolean | undefined, text: string): this;
    /**
     * Writes a line of text.
     * @param str - String to write.
     */
    writeLine(str: string): this;
    /**
     * Writes a newline if the last line was not a newline.
     */
    newLineIfLastNot(): this;
    /**
     * Writes a blank line if the last written text was not a blank line.
     */
    blankLineIfLastNot(): this;
    /**
     * Writes a blank line if the condition is true.
     * @param condition - Condition to evaluate.
     */
    conditionalBlankLine(condition: boolean | undefined): this;
    /**
     * Writes a blank line.
     */
    blankLine(): this;
    /**
     * Indents the code one level for the current line.
     */
    indent(): this;
    /**
     * Writes a newline if the condition is true.
     * @param condition - Condition to evaluate.
     */
    conditionalNewLine(condition: boolean | undefined): this;
    /**
     * Writes a newline.
     */
    newLine(): this;
    /**
     * Writes a quote character.
     */
    quote(): this;
    /**
     * Writes text surrounded in quotes.
     * @param text - Text to write.
     */
    quote(text: string): this;
    /**
     * Writes a space if the last character was not a space.
     */
    spaceIfLastNot(): this;
    /**
     * Writes a space.
     * @param times - Number of times to write a space.
     */
    space(times?: number): this;
    /**
     * Writes a tab if the last character was not a tab.
     */
    tabIfLastNot(): this;
    /**
     * Writes a tab.
     * @param times - Number of times to write a tab.
     */
    tab(times?: number): this;
    /**
     * Conditionally writes text.
     * @param condition - Condition to evaluate.
     * @param textFunc - A function that returns a string to write if the condition is true.
     */
    conditionalWrite(condition: boolean | undefined, textFunc: () => string): this;
    /**
     * Conditionally writes text.
     * @param condition - Condition to evaluate.
     * @param text - Text to write if the condition is true.
     */
    conditionalWrite(condition: boolean | undefined, text: string): this;
    /**
     * Writes the provided text.
     * @param text - Text to write.
     */
    write(text: string): this;
    /**
     * Gets the length of the string in the writer.
     */
    getLength(): number;
    /**
     * Gets if the writer is currently in a comment.
     */
    isInComment(): boolean;
    /**
     * Gets if the writer is currently at the start of the first line of the text, block, or indentation block.
     */
    isAtStartOfFirstLineOfBlock(): boolean;
    /**
     * Gets if the writer is currently on the first line of the text, block, or indentation block.
     */
    isOnFirstLineOfBlock(): boolean;
    /**
     * Gets if the writer is currently in a string.
     */
    isInString(): boolean;
    /**
     * Gets if the last chars written were for a newline.
     */
    isLastNewLine(): boolean;
    /**
     * Gets if the last chars written were for a blank line.
     */
    isLastBlankLine(): boolean;
    /**
     * Gets if the last char written was a space.
     */
    isLastSpace(): boolean;
    /**
     * Gets if the last char written was a tab.
     */
    isLastTab(): boolean;
    /**
     * Gets the last char written.
     */
    getLastChar(): string | undefined;
    /**
     * Gets the writer's text.
     */
    toString(): string;
    private _writeIndentingNewLines(text);
    private _baseWriteNewline();
    private dequeueQueuedIndentation();
    private _updateInternalState(str);
    private _writeIndentation();
    private _newLineIfNewLineOnNextWrite();
    private _getIndentationLevelFromArg(countOrText);
}

// this is a trick to get the import module defined in the local scope by its name, but have the compiler
// understand this as exporting the ambient declaration above (so it works at compile time and run time)
// @ts-ignore: Implicit use of this.
const tempThis = this as any;
tempThis["CodeBlockWriter"] = ImportedCodeBlockWriter;

export { CodeBlockWriter, CodeBlockWriterOptions };
