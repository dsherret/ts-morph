import * as ts from "typescript";
import * as compiler from "./../compiler";
import * as errors from "./../errors";
import {KeyValueCache, Logger, FileUtils, EventContainer, createHashSet} from "./../utils";
import {GlobalContainer} from "./../GlobalContainer";
import {VirtualFileSystemHost} from "./../fileSystem";
import {createWrappedNode} from "./../createWrappedNode";
import {nodeToWrapperMappings} from "./nodeToWrapperMappings";

/**
 * Factory for creating compiler wrappers.
 * @internal
 */
export class CompilerFactory {
    private readonly sourceFileCacheByFilePath = new KeyValueCache<string, compiler.SourceFile>();
    private readonly normalizedDirectories = createHashSet<string>();
    private readonly nodeCache = new KeyValueCache<ts.Node, compiler.Node>();
    private readonly sourceFileAddedEventContainer = new EventContainer<{ addedSourceFile: compiler.SourceFile; }>();

    /**
     * Initializes a new instance of CompilerFactory.
     * @param global - Global container.
     */
    constructor(private readonly global: GlobalContainer) {
    }

    /**
     * Occurs when a source file is added to the cache.
     * @param subscription - Subscripton.
     */
    onSourceFileAdded(subscription: (arg: { addedSourceFile: compiler.SourceFile; }) => void) {
        this.sourceFileAddedEventContainer.subscribe(subscription);
    }

    /**
     * Creates a source file from a file path and text.
     * Adds it to the cache.
     * @param filePath - File path for the source file.
     * @param sourceText - Text to create the source file with.
     */
    addSourceFileFromText(filePath: string, sourceText: string) {
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(filePath);
        if (this.containsSourceFileAtPath(absoluteFilePath))
            throw new errors.InvalidOperationError(`A source file already exists at the provided file path: ${absoluteFilePath}`);
        const compilerSourceFile = ts.createSourceFile(absoluteFilePath, sourceText, this.global.manipulationSettings.getScriptTarget(), true);
        return this.getSourceFile(compilerSourceFile);
    }

    /**
     * Creates a temporary source file that won't be added to the language service.
     * @param sourceText - Text to create the source file with.
     * @param filePath - File path to use.
     * @returns Wrapped source file.
     */
    createTempSourceFileFromText(sourceText: string, opts: { filePath?: string; createLanguageService?: boolean; } = {}) {
        const {filePath = "tsSimpleAstTempFile.ts", createLanguageService = false} = opts;
        const globalContainer = new GlobalContainer(new VirtualFileSystemHost(), this.global.compilerOptions, createLanguageService);
        return globalContainer.compilerFactory.addSourceFileFromText(filePath, sourceText);
    }

    /**
     * Gets a source file from a file path. Will use the file path cache if the file exists.
     * @param filePath - File path to get the file from.
     */
    getSourceFileFromFilePath(filePath: string): compiler.SourceFile | undefined {
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(filePath);
        let sourceFile = this.sourceFileCacheByFilePath.get(absoluteFilePath);
        if (sourceFile == null) {
            if (this.global.fileSystem.fileExistsSync(absoluteFilePath)) {
                Logger.log(`Loading file: ${absoluteFilePath}`);
                sourceFile = this.addSourceFileFromText(absoluteFilePath, this.global.fileSystem.readFile(absoluteFilePath));
                sourceFile.setIsSaved(true); // source files loaded from the disk are saved to start with
            }

            if (sourceFile != null) {
                // ensure these are added to the ast
                sourceFile.getReferencedFiles();
                sourceFile.getTypeReferenceDirectives();
            }
        }

        return sourceFile;
    }

    /**
     * Gets if the internal cache contains a source file at a specific file path.
     * @param filePath - File path to check.
     */
    containsSourceFileAtPath(filePath: string) {
        const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(filePath);
        return this.sourceFileCacheByFilePath.get(absoluteFilePath) != null;
    }

    /**
     * Gets if the internal cache contains a source file with the specified directory path.
     * @param dirPath - Directory path to check.
     */
    containsFileInDirectory(dirPath: string) {
        const normalizedDirPath = FileUtils.getStandardizedAbsolutePath(dirPath);
        return this.normalizedDirectories.has(normalizedDirPath);
    }

    /**
     * Gets the source file for a node.
     * @param compilerNode - Compiler node to get the source file of.
     */
    getSourceFileForNode(compilerNode: ts.Node) {
        let currentNode = compilerNode;
        while (currentNode.kind !== ts.SyntaxKind.SourceFile) {
            if (currentNode.parent == null)
                throw new errors.NotImplementedError("Could not find node source file.");
            currentNode = currentNode.parent;
        }
        return this.getSourceFile(currentNode as ts.SourceFile);
    }

    /**
     * Gets a wrapped compiler type based on the node's kind.
     * @param node - Node to get the wrapped object from.
     */
    getNodeFromCompilerNode<NodeType extends ts.Node>(compilerNode: NodeType, sourceFile: compiler.SourceFile): compiler.Node<NodeType> {
        if (compilerNode.kind === ts.SyntaxKind.SourceFile)
            return this.getSourceFile(compilerNode as any as ts.SourceFile) as compiler.Node as compiler.Node<NodeType>;
        else if (nodeToWrapperMappings[compilerNode.kind] != null)
            return this.nodeCache.getOrCreate<compiler.Node<NodeType>>(compilerNode, () =>
                new nodeToWrapperMappings[compilerNode.kind](this.global, compilerNode, sourceFile));
        else
            return this.nodeCache.getOrCreate<compiler.Node<NodeType>>(compilerNode, () => new compiler.Node(this.global, compilerNode, sourceFile));
    }

    /**
     * Gets a wrapped source file from a compiler source file.
     * @param sourceFile - Compiler source file.
     */
    getSourceFile(compilerSourceFile: ts.SourceFile): compiler.SourceFile {
        return this.nodeCache.getOrCreate<compiler.SourceFile>(compilerSourceFile, () => {
            const sourceFile = new compiler.SourceFile(this.global, compilerSourceFile);
            this.sourceFileCacheByFilePath.set(sourceFile.getFilePath(), sourceFile);

            // add to list of directories
            const normalizedDir = FileUtils.getStandardizedAbsolutePath(FileUtils.getDirPath(sourceFile.getFilePath()));
            if (!this.normalizedDirectories.has(normalizedDir))
                this.normalizedDirectories.add(normalizedDir);

            // fire the event
            this.sourceFileAddedEventContainer.fire({
                addedSourceFile: sourceFile
            });

            return sourceFile;
        });
    }

    /**
     * Gets a warpped symbol display part form a compiler symbol display part.
     * @param compilerObject - Compiler symbol display part.
     */
    getSymbolDisplayPart(compilerObject: ts.SymbolDisplayPart) {
        return new compiler.SymbolDisplayPart(compilerObject);
    }

    /**
     * Gets a wrapped type from a compiler type.
     * @param type - Compiler type.
     */
    getType(type: ts.Type): compiler.Type {
        return new compiler.Type(this.global, type);
    }

    /**
     * Gets a warpped type parameter from a compiler type parameter.
     * @param typeParameter - Compiler type parameter
     */
    getTypeParameter(typeParameter: ts.TypeParameter): compiler.TypeParameter {
        return new compiler.TypeParameter(this.global, typeParameter);
    }

    /**
     * Gets a wrapped signature from a compiler signature.
     * @param signature - Compiler signature.
     */
    getSignature(signature: ts.Signature): compiler.Signature {
        return new compiler.Signature(this.global, signature);
    }

    /**
     * Gets a wrapped symbol from a compiler symbol.
     * @param symbol - Compiler symbol.
     */
    getSymbol(symbol: ts.Symbol): compiler.Symbol {
        return new compiler.Symbol(this.global, symbol);
    }

    /**
     * Gets a wrapped diagnostic from a compiler diagnostic.
     * @param diagnostic - Compiler diagnostic.
     */
    getDiagnostic(diagnostic: ts.Diagnostic): compiler.Diagnostic {
        return new compiler.Diagnostic(this.global, diagnostic);
    }

    /**
     * Gets a wrapped diagnostic message chain from a compiler diagnostic message chain.
     * @param diagnostic - Compiler diagnostic message chain.
     */
    getDiagnosticMessageChain(diagnosticMessageChain: ts.DiagnosticMessageChain): compiler.DiagnosticMessageChain {
        return new compiler.DiagnosticMessageChain(this.global, diagnosticMessageChain);
    }

    /**
     * Gets a warpped JS doc tag info from a compiler object.
     * @param jsDocTagInfo - Compiler object.
     */
    getJSDocTagInfo(jsDocTagInfo: ts.JSDocTagInfo): compiler.JSDocTagInfo {
        return new compiler.JSDocTagInfo(jsDocTagInfo);
    }

    /**
     * Replaces a compiler node in the cache.
     * @param oldNode - Old node to remove.
     * @param newNode - New node to use.
     */
    replaceCompilerNode(oldNode: ts.Node | compiler.Node, newNode: ts.Node) {
        const nodeToReplace = oldNode instanceof compiler.Node ? oldNode.compilerNode : oldNode;
        const node = oldNode instanceof compiler.Node ? oldNode : this.nodeCache.get(oldNode);

        this.nodeCache.replaceKey(nodeToReplace, newNode);

        if (node != null)
            node.replaceCompilerNode(newNode);
    }

    /**
     * Removes a node from the cache.
     * @param node - Node to remove.
     */
    removeNodeFromCache(node: compiler.Node) {
        const compilerNode = node.compilerNode;
        this.nodeCache.removeByKey(compilerNode);

        if (compilerNode.kind === ts.SyntaxKind.SourceFile) {
            const sourceFile = compilerNode as ts.SourceFile;
            this.sourceFileCacheByFilePath.removeByKey(sourceFile.fileName);
        }
    }
}
