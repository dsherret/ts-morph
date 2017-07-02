import * as ts from "typescript";
import * as errors from "./errors";
import {SourceFile, Node} from "./compiler";
import {CompilerFactory} from "./factories";
import {DefaultFileSystemHost} from "./DefaultFileSystemHost";

/**
 * Creates a wrapped node from a compiler node.
 * @param node - Node to create a wrapped node from.
 * @param sourceFile - Optional source file of the node to help improve performance.
 */
export function createWrappedNode<T extends ts.Node = ts.Node>(node: T, sourceFile?: ts.SourceFile | SourceFile): Node<T> {
    let wrappedSourceFile: SourceFile;
    if (sourceFile == null)
        wrappedSourceFile = getSourceFileFromNode(node);
    else if (sourceFile instanceof SourceFile)
        wrappedSourceFile = sourceFile;
    else
        wrappedSourceFile = getWrappedSourceFile(sourceFile);

    return wrappedSourceFile.factory.getNodeFromCompilerNode(node, wrappedSourceFile) as Node<T>;
}

function getSourceFileFromNode(node: ts.Node) {
    if (node.kind === ts.SyntaxKind.SourceFile)
        return getWrappedSourceFile(node as ts.SourceFile);
    if (node.parent == null)
        throw new errors.InvalidOperationError("Please ensure the node was created from a source file with 'setParentNodes' set to 'true'.");

    let parent = node;
    while (parent.parent != null)
        parent = parent.parent;

    if (parent.kind !== ts.SyntaxKind.SourceFile)
        throw new errors.NotImplementedError("For some reason the top parent was not a source file.");

    return getWrappedSourceFile(parent as ts.SourceFile);
}

function getWrappedSourceFile(sourceFile: ts.SourceFile) {
    return getFactory().getSourceFile(sourceFile);
}

function getFactory() {
    return new CompilerFactory(new DefaultFileSystemHost(), undefined);
}
