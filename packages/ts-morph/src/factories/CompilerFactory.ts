import { errors, KeyValueCache, WeakCache, StringUtils, EventContainer, FileUtils, DocumentRegistry, SyntaxKind, ts, TypeFlags, ScriptKind,
    StandardizedFilePath } from "@ts-morph/common";
import { CompilerNodeToWrappedType, DefinitionInfo, Diagnostic, DiagnosticMessageChain, DiagnosticWithLocation, DocumentSpan, JSDocTagInfo, Node,
    ReferencedSymbol, ReferencedSymbolDefinitionInfo, ReferenceEntry, Signature, SourceFile, Symbol, SymbolDisplayPart, Type, TypeParameter, CommentStatement,
    CommentClassElement, CommentTypeElement, CommentObjectLiteralElement, CompilerCommentNode, CommentEnumMember } from "../compiler";
import { CommentNodeParser } from "../compiler/ast/utils";
import { Directory } from "../fileSystem";
import { ProjectContext } from "../ProjectContext";
import { SourceFileCreateOptions } from "../Project";
import { SourceFileStructure, OptionalKind } from "../structures";
import { WriterFunction } from "../types";
import { replaceSourceFileForCacheUpdate } from "../manipulation";
import { getTextFromStringOrWriter } from "../utils";
import { DirectoryCache } from "./DirectoryCache";
import { ForgetfulNodeCache } from "./ForgetfulNodeCache";
import { kindToWrapperMappings } from "./kindToWrapperMappings";

/**
 * Factory for creating compiler wrappers.
 * @internal
 */
export class CompilerFactory {
    private readonly sourceFileCacheByFilePath = new Map<StandardizedFilePath, SourceFile>();
    private readonly diagnosticCache = new WeakCache<ts.Diagnostic, Diagnostic>();
    private readonly definitionInfoCache = new WeakCache<ts.DefinitionInfo, DefinitionInfo>();
    private readonly documentSpanCache = new WeakCache<ts.DocumentSpan, DocumentSpan>();
    private readonly diagnosticMessageChainCache = new WeakCache<ts.DiagnosticMessageChain, DiagnosticMessageChain>();
    private readonly jsDocTagInfoCache = new WeakCache<ts.JSDocTagInfo, JSDocTagInfo>();
    private readonly signatureCache = new WeakCache<ts.Signature, Signature>();
    private readonly symbolCache = new WeakCache<ts.Symbol, Symbol>();
    private readonly symbolDisplayPartCache = new WeakCache<ts.SymbolDisplayPart, SymbolDisplayPart>();
    private readonly referenceEntryCache = new WeakCache<ts.ReferenceEntry, ReferenceEntry>();
    private readonly referencedSymbolCache = new WeakCache<ts.ReferencedSymbol, ReferencedSymbol>();
    private readonly referencedSymbolDefinitionInfoCache = new WeakCache<ts.ReferencedSymbolDefinitionInfo, ReferencedSymbolDefinitionInfo>();
    private readonly typeCache = new WeakCache<ts.Type, Type>();
    private readonly typeParameterCache = new WeakCache<ts.TypeParameter, TypeParameter>();
    private readonly nodeCache = new ForgetfulNodeCache();
    private readonly directoryCache: DirectoryCache;
    private readonly sourceFileAddedEventContainer = new EventContainer<SourceFile>();
    private readonly sourceFileRemovedEventContainer = new EventContainer<SourceFile>();

    readonly documentRegistry: DocumentRegistry;

    /**
     * Initializes a new instance of CompilerFactory.
     * @param context - Project context.
     */
    constructor(private readonly context: ProjectContext) {
        this.documentRegistry = new DocumentRegistry(context.fileSystemWrapper);
        this.directoryCache = new DirectoryCache(context);

        // prevent memory leaks when the document registry key changes by just resetting it
        this.context.compilerOptions.onModified(() => {
            // repopulate the cache
            const currentSourceFiles = Array.from(this.sourceFileCacheByFilePath.values()); // store this to prevent modifying while iterating
            for (const sourceFile of currentSourceFiles) {
                // re-parse the source files in the new document registry, then populate the cache with the new nodes
                replaceSourceFileForCacheUpdate(sourceFile);
            }
        });
    }

    /**
     * Gets all the source files sorted by their directory depth.
     */
    *getSourceFilesByDirectoryDepth() {
        for (const dir of this.getDirectoriesByDepth())
            yield* dir.getSourceFiles();
    }

    /**
     * Gets the source file paths from the internal cache.
     */
    getSourceFilePaths() {
        return this.sourceFileCacheByFilePath.keys();
    }

    /**
     * Gets the child directories of a directory.
     * @param dirPath - Directory path.
     */
    getChildDirectoriesOfDirectory(dirPath: StandardizedFilePath) {
        return this.directoryCache.getChildDirectoriesOfDirectory(dirPath);
    }

    /**
     * Gets the child source files of a directory.
     * @param dirPath - Directory path.
     */
    getChildSourceFilesOfDirectory(dirPath: StandardizedFilePath) {
        return this.directoryCache.getChildSourceFilesOfDirectory(dirPath);
    }

    /**
     * Occurs when a source file is added to the cache.
     * @param subscription - Subscription.
     * @param subscribe - Whether to subscribe or unsubscribe (default to true).
     */
    onSourceFileAdded(subscription: (sourceFile: SourceFile) => void, subscribe = true) {
        if (subscribe)
            this.sourceFileAddedEventContainer.subscribe(subscription);
        else
            this.sourceFileAddedEventContainer.unsubscribe(subscription);
    }

    /**
     * Occurs when a source file is removed from the cache.
     * @param subscription - Subscripton.
     */
    onSourceFileRemoved(subscription: (sourceFile: SourceFile) => void) {
        this.sourceFileRemovedEventContainer.subscribe(subscription);
    }

    /**
     * Adds a source file by structure or text.
     * @param filePath - File path.
     * @param structureOrText - Structure or text.
     * @param options - Options.
     */
    createSourceFile(
        filePath: StandardizedFilePath,
        sourceFileText: string | OptionalKind<SourceFileStructure> | WriterFunction,
        options: SourceFileCreateOptions & { markInProject: boolean; }
    ) {
        sourceFileText = sourceFileText instanceof Function ? getTextFromStringOrWriter(this.context.createWriter(), sourceFileText) : sourceFileText || "";
        if (typeof sourceFileText === "string")
            return this.createSourceFileFromText(filePath, sourceFileText, options);

        const writer = this.context.createWriter();
        const structurePrinter = this.context.structurePrinterFactory.forSourceFile({
            isAmbient: FileUtils.getExtension(filePath) === ".d.ts"
        });
        structurePrinter.printText(writer, sourceFileText);

        return this.createSourceFileFromText(filePath, writer.toString(), options);
    }

    /**
     * Creates a source file from a file path and text.
     * Adds it to the cache.
     * @param filePath - File path for the source file.
     * @param sourceText - Text to create the source file with.
     * @param options - Options.
     * @throws InvalidOperationError if the file exists.
     */
    createSourceFileFromText(filePath: StandardizedFilePath, sourceText: string, options: SourceFileCreateOptions & { markInProject: boolean; }) {
        filePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        if (options.overwrite === true)
            return this.createOrOverwriteSourceFileFromText(filePath, sourceText, options as MakeOptionalUndefined<typeof options>);
        this.throwIfFileExists(filePath, "Did you mean to provide the overwrite option?");
        return this.createSourceFileFromTextInternal(filePath, sourceText, options as MakeOptionalUndefined<typeof options>);
    }

    /**
     * Throws an error if the file exists in the cache or file system.
     * @param filePath - File path.
     * @param prefixMessage - Message to attach on as a prefix.
     */
    throwIfFileExists(filePath: StandardizedFilePath, prefixMessage?: string) {
        if (!this.containsSourceFileAtPath(filePath) && !this.context.fileSystemWrapper.fileExistsSync(filePath))
            return;
        prefixMessage = prefixMessage == null ? "" : prefixMessage + " ";
        throw new errors.InvalidOperationError(`${prefixMessage}A source file already exists at the provided file path: ${filePath}`);
    }

    private createOrOverwriteSourceFileFromText(
        filePath: StandardizedFilePath,
        sourceText: string,
        options: { markInProject: boolean; scriptKind: ScriptKind | undefined; }
    ) {
        filePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        const existingSourceFile = this.addOrGetSourceFileFromFilePath(filePath, options);
        if (existingSourceFile != null) {
            existingSourceFile.getChildren().forEach(c => c.forget());
            this.replaceCompilerNode(existingSourceFile, this.createCompilerSourceFileFromText(filePath, sourceText, options.scriptKind));
            return existingSourceFile;
        }

        return this.createSourceFileFromTextInternal(filePath, sourceText, options);
    }

    /**
     * Gets the source file from the cache by a file path.
     * @param filePath - File path.
     */
    getSourceFileFromCacheFromFilePath(filePath: StandardizedFilePath): SourceFile | undefined {
        filePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        return this.sourceFileCacheByFilePath.get(filePath);
    }

    /**
     * Gets a source file from a file path. Will use the file path cache if the file exists.
     * @param filePath - File path to get the file from.
     */
    addOrGetSourceFileFromFilePath(filePath: StandardizedFilePath, options: { markInProject: boolean; scriptKind: ScriptKind | undefined; }): SourceFile
        | undefined
    {
        filePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        let sourceFile = this.sourceFileCacheByFilePath.get(filePath);
        if (sourceFile == null) {
            let fileText: string | undefined;
            try {
                fileText = this.context.fileSystemWrapper.readFileSync(filePath, this.context.getEncoding());
            } catch {
                // ignore
            }

            if (fileText != null) {
                this.context.logger.log(`Loaded file: ${filePath}`);
                sourceFile = this.createSourceFileFromTextInternal(filePath, fileText, options);
                sourceFile._setIsSaved(true); // source files loaded from the disk are saved to start with
            }
        }

        if (sourceFile != null && options.markInProject)
            sourceFile._markAsInProject();

        return sourceFile;
    }

    /**
     * Gets if the internal cache contains a source file at a specific file path.
     * @param filePath - File path to check.
     */
    containsSourceFileAtPath(filePath: StandardizedFilePath) {
        filePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        return this.sourceFileCacheByFilePath.has(filePath);
    }

    /**
     * Gets if the internal cache contains a source file with the specified directory path.
     * @param dirPath - Directory path to check.
     */
    containsDirectoryAtPath(dirPath: StandardizedFilePath) {
        dirPath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
        return this.directoryCache.has(dirPath);
    }

    /**
     * Gets the source file for a node.
     * @param compilerNode - Compiler node to get the source file of.
     */
    getSourceFileForNode(compilerNode: ts.Node) {
        let currentNode = compilerNode;
        while (currentNode.kind !== SyntaxKind.SourceFile) {
            if (currentNode.parent == null)
                return undefined;
            currentNode = currentNode.parent;
        }
        return this.getSourceFile(currentNode as ts.SourceFile, { markInProject: false });
    }

    /**
     * Gets if the factory contains the compiler node in its internal cache.
     * @param compilerNode - Compiler node.
     */
    hasCompilerNode(compilerNode: ts.Node) {
        return this.nodeCache.has(compilerNode);
    }

    /**
     * Gets an existing node from the cache.
     * @param compilerNode - Compiler node.
     */
    getExistingCompilerNode(compilerNode: ts.Node) {
        return this.nodeCache.get(compilerNode);
    }

    /**
     * Gets a wrapped compiler type based on the node's kind.
     * @param node - Node to get the wrapped object from.
     */
    getNodeFromCompilerNode<NodeType extends ts.Node>(compilerNode: NodeType, sourceFile: SourceFile | undefined): CompilerNodeToWrappedType<NodeType> {
        if (compilerNode.kind === SyntaxKind.SourceFile)
            return this.getSourceFile(compilerNode as any as ts.SourceFile, { markInProject: false }) as Node as CompilerNodeToWrappedType<NodeType>;

        return this.nodeCache.getOrCreate<Node<NodeType>>(compilerNode, () => {
            const node = createNode.call(this);
            initializeNode.call(this, node);
            return node;
        }) as Node as CompilerNodeToWrappedType<NodeType>;

        function createNode(this: CompilerFactory): Node<NodeType> {
            // todo: improve kind to wrapper mappings to handle this scenario
            if (isCommentNode(compilerNode)) {
                if (CommentNodeParser.isCommentStatement(compilerNode))
                    return new CommentStatement(this.context, compilerNode, sourceFile) as any as Node<NodeType>;
                if (CommentNodeParser.isCommentClassElement(compilerNode))
                    return new CommentClassElement(this.context, compilerNode, sourceFile) as any as Node<NodeType>;
                if (CommentNodeParser.isCommentTypeElement(compilerNode))
                    return new CommentTypeElement(this.context, compilerNode, sourceFile) as any as Node<NodeType>;
                if (CommentNodeParser.isCommentObjectLiteralElement(compilerNode))
                    return new CommentObjectLiteralElement(this.context, compilerNode, sourceFile) as any as Node<NodeType>;
                if (CommentNodeParser.isCommentEnumMember(compilerNode))
                    return new CommentEnumMember(this.context, compilerNode, sourceFile) as any as Node<NodeType>;
                return errors.throwNotImplementedForNeverValueError(compilerNode);
            }

            const ctor = kindToWrapperMappings[compilerNode.kind] || Node as any;
            return new ctor(this.context, compilerNode, sourceFile) as Node<NodeType>;
        }

        function isCommentNode(node: ts.Node): node is CompilerCommentNode {
            return (node as CompilerCommentNode)._commentKind != null;
        }

        function initializeNode(this: CompilerFactory, node: Node<NodeType>) {
            // ensure the parent is created and increment its wrapped child count
            if (compilerNode.parent != null) {
                const parentNode = this.getNodeFromCompilerNode(compilerNode.parent, sourceFile);
                parentNode._wrappedChildCount++;
            }
            const parentSyntaxList = node._getParentSyntaxListIfWrapped();
            if (parentSyntaxList != null)
                parentSyntaxList._wrappedChildCount++;

            if (compilerNode.kind === SyntaxKind.SyntaxList) {
                let count = 0;
                for (const _ of node._getChildrenInCacheIterator())
                    count++;
                node._wrappedChildCount = count;
            }
        }
    }

    private createSourceFileFromTextInternal(
        filePath: StandardizedFilePath,
        text: string,
        options: { markInProject: boolean; scriptKind: ScriptKind | undefined; }
    ): SourceFile {
        const hasBom = StringUtils.hasBom(text);
        if (hasBom)
            text = StringUtils.stripBom(text);
        const sourceFile = this.getSourceFile(this.createCompilerSourceFileFromText(filePath, text, options.scriptKind), options);
        if (hasBom)
            sourceFile._hasBom = true;
        return sourceFile;
    }

    createCompilerSourceFileFromText(filePath: StandardizedFilePath, text: string, scriptKind: ScriptKind | undefined): ts.SourceFile {
        return this.documentRegistry.createOrUpdateSourceFile(filePath, this.context.compilerOptions.get(), ts.ScriptSnapshot.fromString(text), scriptKind);
    }

    /**
     * Gets a wrapped source file from a compiler source file.
     * @param sourceFile - Compiler source file.
     */
    getSourceFile(compilerSourceFile: ts.SourceFile, options: { markInProject: boolean; }): SourceFile {
        let wasAdded = false;
        const sourceFile = this.nodeCache.getOrCreate<SourceFile>(compilerSourceFile, () => {
            const createdSourceFile = new SourceFile(this.context, compilerSourceFile);

            if (!options.markInProject)
                this.context.inProjectCoordinator.setSourceFileNotInProject(createdSourceFile);

            this.addSourceFileToCache(createdSourceFile);
            wasAdded = true;
            return createdSourceFile;
        });

        if (options.markInProject)
            sourceFile._markAsInProject();

        if (wasAdded)
            this.sourceFileAddedEventContainer.fire(sourceFile);

        return sourceFile;
    }

    private addSourceFileToCache(sourceFile: SourceFile) {
        this.sourceFileCacheByFilePath.set(sourceFile.getFilePath(), sourceFile);
        this.context.fileSystemWrapper.removeFileDelete(sourceFile.getFilePath());
        this.directoryCache.addSourceFile(sourceFile);
    }

    /**
     * Gets a directory from a path.
     * @param dirPath - Directory path.
     */
    getDirectoryFromPath(dirPath: StandardizedFilePath, options: { markInProject: boolean; }) {
        dirPath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
        let directory = this.directoryCache.get(dirPath);

        if (directory == null && this.context.fileSystemWrapper.directoryExistsSync(dirPath))
            directory = this.directoryCache.createOrAddIfExists(dirPath);

        if (directory != null && options.markInProject)
            directory._markAsInProject();

        return directory;
    }

    /**
     * Creates or adds a directory if it doesn't exist.
     * @param dirPath - Directory path.
     */
    createDirectoryOrAddIfExists(dirPath: StandardizedFilePath, options: { markInProject: boolean; }) {
        const directory = this.directoryCache.createOrAddIfExists(dirPath);
        if (directory != null && options.markInProject)
            directory._markAsInProject();
        return directory;
    }

    /**
     * Gets a directory.
     * @param dirPath - Directory path.
     */
    getDirectoryFromCache(dirPath: StandardizedFilePath) {
        return this.directoryCache.get(dirPath);
    }

    /**
     * Gets a directory from the cache, but only if it's in the cache.
     * @param dirPath - Directory path.
     */
    getDirectoryFromCacheOnlyIfInCache(dirPath: StandardizedFilePath) {
        return this.directoryCache.has(dirPath)
            ? this.directoryCache.get(dirPath)
            : undefined;
    }

    /**
     * Gets all the directories iterated by depth.
     */
    getDirectoriesByDepth() {
        return this.directoryCache.getAllByDepth();
    }

    /**
     * Gets the directories without a parent.
     */
    getOrphanDirectories() {
        return this.directoryCache.getOrphans();
    }

    /**
     * Gets a warpped symbol display part form a compiler symbol display part.
     * @param compilerObject - Compiler symbol display part.
     */
    getSymbolDisplayPart(compilerObject: ts.SymbolDisplayPart) {
        return this.symbolDisplayPartCache.getOrCreate(compilerObject, () => new SymbolDisplayPart(compilerObject));
    }

    /**
     * Gets a wrapped type from a compiler type.
     * @param type - Compiler type.
     */
    getType<TType extends ts.Type>(type: TType): Type<TType> {
        if ((type.flags & TypeFlags.TypeParameter) === TypeFlags.TypeParameter)
            return this.getTypeParameter(type as any as ts.TypeParameter) as any as Type<TType>;
        return this.typeCache.getOrCreate(type, () => new Type<TType>(this.context, type));
    }

    /**
     * Gets a wrapped type parameter from a compiler type parameter.
     * @param typeParameter - Compiler type parameter
     */
    getTypeParameter(typeParameter: ts.TypeParameter): TypeParameter {
        return this.typeParameterCache.getOrCreate(typeParameter, () => new TypeParameter(this.context, typeParameter));
    }

    /**
     * Gets a wrapped signature from a compiler signature.
     * @param signature - Compiler signature.
     */
    getSignature(signature: ts.Signature): Signature {
        return this.signatureCache.getOrCreate(signature, () => new Signature(this.context, signature));
    }

    /**
     * Gets a wrapped symbol from a compiler symbol.
     * @param symbol - Compiler symbol.
     */
    getSymbol(symbol: ts.Symbol): Symbol {
        return this.symbolCache.getOrCreate(symbol, () => new Symbol(this.context, symbol));
    }

    /**
     * Gets a wrapped definition info from a compiler object.
     * @param compilerObject - Compiler definition info.
     */
    getDefinitionInfo(compilerObject: ts.DefinitionInfo): DefinitionInfo {
        return this.definitionInfoCache.getOrCreate(compilerObject, () => new DefinitionInfo(this.context, compilerObject));
    }

    /**
     * Gets a wrapped document span from a compiler object.
     * @param compilerObject - Compiler document span.
     */
    getDocumentSpan(compilerObject: ts.DocumentSpan): DocumentSpan {
        return this.documentSpanCache.getOrCreate(compilerObject, () => new DocumentSpan(this.context, compilerObject));
    }

    /**
     * Gets a wrapped referenced entry from a compiler object.
     * @param compilerObject - Compiler referenced entry.
     */
    getReferenceEntry(compilerObject: ts.ReferenceEntry): ReferenceEntry {
        return this.referenceEntryCache.getOrCreate(compilerObject, () => new ReferenceEntry(this.context, compilerObject));
    }

    /**
     * Gets a wrapped referenced symbol from a compiler object.
     * @param compilerObject - Compiler referenced symbol.
     */
    getReferencedSymbol(compilerObject: ts.ReferencedSymbol): ReferencedSymbol {
        return this.referencedSymbolCache.getOrCreate(compilerObject, () => new ReferencedSymbol(this.context, compilerObject));
    }

    /**
     * Gets a wrapped referenced symbol definition info from a compiler object.
     * @param compilerObject - Compiler referenced symbol definition info.
     */
    getReferencedSymbolDefinitionInfo(compilerObject: ts.ReferencedSymbolDefinitionInfo): ReferencedSymbolDefinitionInfo {
        return this.referencedSymbolDefinitionInfoCache.getOrCreate(compilerObject, () => new ReferencedSymbolDefinitionInfo(this.context, compilerObject));
    }

    /**
     * Gets a wrapped diagnostic from a compiler diagnostic.
     * @param diagnostic - Compiler diagnostic.
     */
    getDiagnostic(diagnostic: ts.Diagnostic): Diagnostic {
        return this.diagnosticCache.getOrCreate(diagnostic, () => {
            if (diagnostic.start != null)
                return new DiagnosticWithLocation(this.context, diagnostic as ts.DiagnosticWithLocation);
            return new Diagnostic(this.context, diagnostic);
        });
    }

    /**
     * Gets a wrapped diagnostic with location from a compiler diagnostic.
     * @param diagnostic - Compiler diagnostic.
     */
    getDiagnosticWithLocation(diagnostic: ts.DiagnosticWithLocation): DiagnosticWithLocation {
        return this.diagnosticCache.getOrCreate(diagnostic, () => new DiagnosticWithLocation(this.context, diagnostic));
    }

    /**
     * Gets a wrapped diagnostic message chain from a compiler diagnostic message chain.
     * @param diagnosticMessageChain - Compiler diagnostic message chain.
     */
    getDiagnosticMessageChain(compilerObject: ts.DiagnosticMessageChain): DiagnosticMessageChain {
        return this.diagnosticMessageChainCache.getOrCreate(compilerObject, () => new DiagnosticMessageChain(compilerObject));
    }

    /**
     * Gets a warpped JS doc tag info from a compiler object.
     * @param jsDocTagInfo - Compiler object.
     */
    getJSDocTagInfo(jsDocTagInfo: ts.JSDocTagInfo): JSDocTagInfo {
        return this.jsDocTagInfoCache.getOrCreate(jsDocTagInfo, () => new JSDocTagInfo(jsDocTagInfo));
    }

    /**
     * Replaces a compiler node in the cache.
     * @param oldNode - Old node to remove.
     * @param newNode - New node to use.
     */
    replaceCompilerNode(oldNode: ts.Node | Node, newNode: ts.Node) {
        const nodeToReplace = oldNode instanceof Node ? oldNode.compilerNode : oldNode;
        const node = oldNode instanceof Node ? oldNode : this.nodeCache.get(oldNode);

        if (nodeToReplace.kind === SyntaxKind.SourceFile && (nodeToReplace as ts.SourceFile).fileName !== (newNode as ts.SourceFile).fileName) {
            const sourceFile = node! as SourceFile;
            this.removeCompilerNodeFromCache(nodeToReplace);
            sourceFile._replaceCompilerNodeFromFactory(newNode as ts.SourceFile);
            this.nodeCache.set(newNode, sourceFile);
            this.addSourceFileToCache(sourceFile);
            this.sourceFileAddedEventContainer.fire(sourceFile);
        }
        else {
            this.nodeCache.replaceKey(nodeToReplace, newNode);
            if (node != null)
                node._replaceCompilerNodeFromFactory(newNode);
        }
    }

    /**
     * Removes a node from the cache.
     * @param node - Node to remove.
     */
    removeNodeFromCache(node: Node) {
        this.removeCompilerNodeFromCache(node.compilerNode);
    }

    /**
     * Removes a compiler node from the cache.
     * @param compilerNode - Compiler node to remove.
     */
    private removeCompilerNodeFromCache(compilerNode: ts.Node) {
        this.nodeCache.removeByKey(compilerNode);

        if (compilerNode.kind === SyntaxKind.SourceFile) {
            const sourceFile = compilerNode as ts.SourceFile;
            const standardizedFilePath = this.context.fileSystemWrapper.getStandardizedAbsolutePath(sourceFile.fileName);
            this.directoryCache.removeSourceFile(standardizedFilePath);
            const wrappedSourceFile = this.sourceFileCacheByFilePath.get(standardizedFilePath);
            this.sourceFileCacheByFilePath.delete(standardizedFilePath);
            this.documentRegistry.removeSourceFile(standardizedFilePath);
            if (wrappedSourceFile != null)
                this.sourceFileRemovedEventContainer.fire(wrappedSourceFile);
        }
    }

    /**
     * Adds the specified directory to the cache.
     * @param directory - Directory
     */
    addDirectoryToCache(directory: Directory) {
        this.directoryCache.addDirectory(directory);
    }

    /**
     * Removes the directory from the cache.
     * @param dirPath - Directory path.
     */
    removeDirectoryFromCache(dirPath: StandardizedFilePath) {
        this.directoryCache.remove(dirPath);
    }

    /**
     * Forgets the nodes created in the block.
     * @param block - Block of code to run.
     */
    forgetNodesCreatedInBlock<T = void>(block: (remember: (...node: Node[]) => void) => T): T;
    /**
     * Asynchronously forgets the nodes created in the block.
     * @param block - Block of code to run.
     */
    forgetNodesCreatedInBlock<T = void>(block: (remember: (...node: Node[]) => void) => Promise<T>): Promise<T>;
    forgetNodesCreatedInBlock<T = void>(block: (remember: (...node: Node[]) => void) => (T | Promise<T>)): Promise<T> | T {
        // can't use the async keyword here because exceptions that happen when doing this synchronously need to be thrown
        this.nodeCache.setForgetPoint();
        let wasPromise = false;
        let result: T | Promise<T>;
        try {
            result = block((...nodes) => {
                for (const node of nodes)
                    this.nodeCache.rememberNode(node);
            });

            if (Node.isNode(result))
                this.nodeCache.rememberNode(result);

            if (isPromise(result)) {
                wasPromise = true;
                return result.then(value => {
                    if (Node.isNode(value))
                        this.nodeCache.rememberNode(value);

                    this.nodeCache.forgetLastPoint();
                    return value;
                });
            }
        } finally {
            if (!wasPromise)
                this.nodeCache.forgetLastPoint();
        }
        return result;

        function isPromise<TValue>(value: unknown): value is Promise<TValue> {
            return value != null && typeof (value as any).then === "function";
        }
    }
}
