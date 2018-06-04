import { EmitHint, NewLineKind, ScriptKind, ScriptTarget, SyntaxKind, ts } from "../../typescript";

/**
 * Options for printing a node.
 */
export interface PrintNodeOptions {
    /**
     * Whether to remove comments or not.
     */
    removeComments?: boolean;
    /**
     * New line kind.
     *
     * Defaults to line feed.
     */
    newLineKind?: NewLineKind;
    /**
     * From the compiler api: "A value indicating the purpose of a node. This is primarily used to
     * distinguish between an `Identifier` used in an expression position, versus an
     * `Identifier` used as an `IdentifierName` as part of a declaration. For most nodes you
     * should just pass `Unspecified`."
     *
     * Defaults to `Unspecified`.
     */
    emitHint?: EmitHint;
    /**
     * The script kind.
     *
     * Defaults to TSX. This is only useful when not using a wrapped node and not providing a source file.
     */
    scriptKind?: ScriptKind;
}

/**
 * Prints the provided node using the compiler's printer.
 * @param node - Compiler node.
 * @param options - Options.
 */
export function printNode(node: ts.Node, options?: PrintNodeOptions): string;
/**
 * Prints the provided node using the compiler's printer.
 * @param node - Compiler node.
 * @param sourceFile - Compiler source file.
 * @param options - Options.
 */
export function printNode(node: ts.Node, sourceFile: ts.SourceFile, options?: PrintNodeOptions): string;
export function printNode(node: ts.Node, sourceFileOrOptions?: PrintNodeOptions | ts.SourceFile, secondOverloadOptions?: PrintNodeOptions) {
    const isFirstOverload = sourceFileOrOptions == null || (sourceFileOrOptions as ts.SourceFile).kind !== SyntaxKind.SourceFile;
    const options = getOptions();
    const sourceFile = getSourceFile();

    const printer = ts.createPrinter({
        newLine: options.newLineKind == null ? NewLineKind.LineFeed : options.newLineKind,
        removeComments: options.removeComments || false
    });

    if (sourceFile == null)
        return printer.printFile(node as ts.SourceFile);
    else
        return printer.printNode(options.emitHint == null ? EmitHint.Unspecified : options.emitHint, node, sourceFile);

    function getSourceFile() {
        if (isFirstOverload) {
            if (node.kind === SyntaxKind.SourceFile)
                return undefined;
            const scriptKind = getScriptKind();
            return ts.createSourceFile(`print.${getFileExt(scriptKind)}`, "", ScriptTarget.Latest, false, scriptKind);
        }

        return sourceFileOrOptions as ts.SourceFile;

        function getScriptKind() {
            return options.scriptKind == null ? ScriptKind.TSX : options.scriptKind;
        }

        function getFileExt(scriptKind: ScriptKind) {
            if (scriptKind === ScriptKind.JSX || scriptKind === ScriptKind.TSX)
                return "tsx";
            return "ts";
        }
    }

    function getOptions() {
        return (isFirstOverload ? sourceFileOrOptions as PrintNodeOptions : secondOverloadOptions) || {};
    }
}
