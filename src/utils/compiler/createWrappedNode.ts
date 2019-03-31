/* barrel:ignore */
import { CompilerNodeToWrappedType } from "../../compiler";
import * as errors from "../../errors";
import { DefaultFileSystemHost, FileSystemWrapper } from "../../fileSystem";
import { ProjectContext } from "../../ProjectContext";
import { CompilerOptions, SyntaxKind, ts } from "../../typescript";

export interface CreateWrappedNodeOptions {
    /**
     * Compiler options.
     */
    compilerOptions?: CompilerOptions;
    /**
     * Optional source file of the node. Will make it not bother going up the tree to find the source file.
     */
    sourceFile?: ts.SourceFile;
    /**
     * Type checker.
     */
    typeChecker?: ts.TypeChecker;
}

/**
 * Creates a wrapped node from a compiler node.
 * @param node - Node to create a wrapped node from.
 * @param info - Info for creating the wrapped node.
 */
export function createWrappedNode<T extends ts.Node = ts.Node>(node: T, opts: CreateWrappedNodeOptions = {}): CompilerNodeToWrappedType<T> {
    const { compilerOptions = {}, sourceFile, typeChecker } = opts;
    const projectContext = new ProjectContext(undefined, new FileSystemWrapper(new DefaultFileSystemHost()), compilerOptions, { createLanguageService: false, typeChecker });
    const wrappedSourceFile = projectContext.compilerFactory.getSourceFile(getSourceFileNode(), { markInProject: true });

    return projectContext.compilerFactory.getNodeFromCompilerNode(node, wrappedSourceFile);

    function getSourceFileNode() {
        return sourceFile == null ? getSourceFileFromNode(node) : sourceFile;
    }

    function getSourceFileFromNode(compilerNode: ts.Node) {
        if (compilerNode.kind === SyntaxKind.SourceFile)
            return compilerNode as ts.SourceFile;
        if (compilerNode.parent == null)
            throw new errors.InvalidOperationError("Please ensure the node was created from a source file with 'setParentNodes' set to 'true'.");

        let parent = compilerNode;
        while (parent.parent != null)
            parent = parent.parent;

        if (parent.kind !== SyntaxKind.SourceFile)
            throw new errors.NotImplementedError("For some reason the top parent was not a source file.");

        return parent as ts.SourceFile;
    }
}
