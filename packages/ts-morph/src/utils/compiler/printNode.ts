import { EmitHint, NewLineKind, ScriptKind, ScriptTarget, SyntaxKind, ts } from "@ts-morph/common";

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
     * @remarks This is only useful when passing in a compiler node that was constructed
     * with the compiler API factory methods.
     *
     * Defaults to TSX.
     */
    scriptKind?: ScriptKind;
}

/**
 * Prints the provided node using the compiler's printer.
 * @param node - Compiler node.
 * @param options - Options.
 * @remarks If the node was not constructed with the compiler API factory methods and the node
 * does not have parents set, then use the other overload that accepts a source file.
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
        newLine: options.newLineKind ?? NewLineKind.LineFeed,
        removeComments: options.removeComments || false
    });

    if (sourceFile == null)
        return printer.printFile(node as ts.SourceFile);
    else
        return printer.printNode(options.emitHint ?? EmitHint.Unspecified, node, sourceFile);

    function getSourceFile() {
        if (isFirstOverload) {
            if (node.kind === SyntaxKind.SourceFile)
                return undefined;
            const topParent = getNodeSourceFile();
            if (topParent == null) {
                // create a result file (see https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API)
                const scriptKind = getScriptKind();
                return ts.createSourceFile(`print.${getFileExt(scriptKind)}`, "", ScriptTarget.Latest, false, scriptKind);
            }
            return topParent;
        }

        return sourceFileOrOptions as ts.SourceFile;

        function getScriptKind() {
            return options.scriptKind ?? ScriptKind.TSX;
        }

        function getFileExt(scriptKind: ScriptKind) {
            if (scriptKind === ScriptKind.JSX || scriptKind === ScriptKind.TSX)
                return "tsx";
            return "ts";
        }
    }

    function getNodeSourceFile() {
        let topNode: ts.Node | undefined = node.parent;
        while (topNode != null && topNode.parent != null)
            topNode = topNode.parent;
        return topNode as ts.SourceFile;
    }

    function getOptions() {
        return (isFirstOverload ? sourceFileOrOptions as PrintNodeOptions : secondOverloadOptions) || {};
    }
}
