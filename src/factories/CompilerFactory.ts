import {ts, SyntaxKind, TypeFlags} from "../typescript";
import {SourceFile, Node, SymbolDisplayPart, Symbol, Type, TypeParameter, Signature, DefinitionInfo, Diagnostic, DiagnosticMessageChain,
    JSDocTagInfo, ReferencedSymbol, ReferencedSymbolDefinitionInfo, DocumentSpan, ReferenceEntry} from "../compiler";
import * as errors from "../errors";
import {SourceFileStructure} from "../structures";
import {KeyValueCache, WeakCache, FileUtils, EventContainer, createHashSet, ArrayUtils, createCompilerSourceFile} from "../utils";
import {CreateSourceFileOptions} from "../Project";
import {GlobalContainer} from "../GlobalContainer";
import {Directory} from "../fileSystem";
import {createTempSourceFile} from "./createTempSourceFile";
import {nodeToWrapperMappings} from "./nodeToWrapperMappings";
import {ForgetfulNodeCache} from "./ForgetfulNodeCache";
import {DirectoryCache} from "./DirectoryCache";

/**
 * Factory for creating compiler wrappers.
 * @internal
 */
export class CompilerFactory {
    private readonly sourceFileCacheByFilePath = new KeyValueCache<string, SourceFile>();
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

    /**
     * Initializes a new instance of CompilerFactory.
     * @param global - Global container.
     */
    constructor(private readonly global: GlobalContainer) {
        this.directoryCache = new DirectoryCache(global);
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
        return ArrayUtils.from(this.sourceFileCacheByFilePath.getKeys());
    }

    /**
     * Occurs when a source file is added to the cache.
     * @param subscription - Subscripton.
     */
    onSourceFileAdded(subscription: (sourceFile: SourceFile) => void) {
        this.sourceFileAddedEventContainer.subscribe(subscription);
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
    createSourceFile(filePath: string, structureOrText: string | SourceFileStructure, options: CreateSourceFileOptions) {
        if (structureOrText == null || typeof structureOrText === "string")
            return this.createSourceFileFromText(filePath, structureOrText || "", options);

        const sourceFile = this.createSourceFileFromText(filePath, "", options);
        sourceFile.fill(structureOrText);
        return sourceFile;
    }

    /**
     * Creates a source file from a file path and text.
     * Adds it to the cache.
     * @param filePath - File path for the source file.
     * @param sourceText - Text to create the source file with.
     * @param options - Options.
     * @throws InvalidOperationError if the file exists.
     */
    createSourceFileFromText(filePath: string, sourceText: string, options: CreateSourceFileOptions) {
        filePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        if (options != null && options.overwrite === true)
            return this.createOrOverwriteSourceFileFromText(filePath, sourceText);
        this.throwIfFileExists(filePath);
        return this.getSourceFileFromText(filePath, sourceText);
    }

    /**
     * Throws an error if the file exists in the cache or file system.
     * @param filePath - File path.
     * @param prefixMessage - Message to attach on as a prefix.
     */
    throwIfFileExists(filePath: string, prefixMessage?: string) {
        if (!this.containsSourceFileAtPath(filePath) && !this.global.fileSystemWrapper.fileExistsSync(filePath))
            return;
        prefixMessage = prefixMessage == null ? "" : prefixMessage + " ";
        throw new errors.InvalidOperationError(`${prefixMessage}A source file already exists at the provided file path: ${filePath}`);
    }

    private createOrOverwriteSourceFileFromText(filePath: string, sourceText: string) {
        filePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        const existingSourceFile = this.addOrGetSourceFileFromFilePath(filePath);
        if (existingSourceFile != null) {
            existingSourceFile.replaceWithText(sourceText);
            return existingSourceFile;
        }
        return this.getSourceFileFromText(filePath, sourceText);
    }

    /**
     * Creates a temporary source file that won't be added to the language service.
     * @param sourceText - Text to create the source file with.
     * @param filePath - File path to use.
     * @returns Wrapped source file.
     */
    createTempSourceFileFromText(sourceText: string, opts: { filePath?: string; createLanguageService?: boolean; } = {}) {
        const {filePath = "tsSimpleAstTempFile.ts", createLanguageService = false} = opts;
        return createTempSourceFile(filePath, sourceText, {
            createLanguageService,
            compilerOptions: this.global.compilerOptions,
            manipulationSettings: this.global.manipulationSettings.get()
        });
    }

    /**
     * Gets the source file from the cache by a file path.
     * @param filePath - File path.
     */
    getSourceFileFromCacheFromFilePath(filePath: string): SourceFile | undefined {
        filePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        return this.sourceFileCacheByFilePath.get(filePath);
    }

    /**
     * Gets a source file from a file path. Will use the file path cache if the file exists.
     * @param filePath - File path to get the file from.
     */
    addOrGetSourceFileFromFilePath(filePath: string): SourceFile | undefined {
        filePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        let sourceFile = this.sourceFileCacheByFilePath.get(filePath);
        if (sourceFile == null) {
            if (this.global.fileSystemWrapper.fileExistsSync(filePath)) {
                this.global.logger.log(`Loading file: ${filePath}`);
                sourceFile = this.getSourceFileFromText(filePath, this.global.fileSystemWrapper.readFileSync(filePath, this.global.getEncoding()));
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
        const absoluteFilePath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
        return this.sourceFileCacheByFilePath.has(absoluteFilePath);
    }

    /**
     * Gets if the internal cache contains a source file with the specified directory path.
     * @param dirPath - Directory path to check.
     */
    containsDirectoryAtPath(dirPath: string) {
        const normalizedDirPath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
        return this.directoryCache.has(normalizedDirPath);
    }

    /**
     * Gets the source file for a node.
     * @param compilerNode - Compiler node to get the source file of.
     */
    getSourceFileForNode(compilerNode: ts.Node) {
        let currentNode = compilerNode;
        while (currentNode.kind !== SyntaxKind.SourceFile) {
            if (currentNode.parent == null)
                throw new errors.NotImplementedError("Could not find node source file.");
            currentNode = currentNode.parent;
        }
        return this.getSourceFile(currentNode as ts.SourceFile);
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
    getNodeFromCompilerNode<NodeType extends ts.Node>(compilerNode: NodeType, sourceFile: SourceFile): Node<NodeType> {
        if (compilerNode.kind === SyntaxKind.SourceFile)
            return this.getSourceFile(compilerNode as any as ts.SourceFile) as Node as Node<NodeType>;

        const createNode = (ctor: any) => {
            // ensure the parent is created
            if (compilerNode.parent != null && !this.nodeCache.has(compilerNode.parent))
                this.getNodeFromCompilerNode(compilerNode.parent, sourceFile);
            return new ctor(this.global, compilerNode, sourceFile);
        };

        if (nodeToWrapperMappings[compilerNode.kind] != null)
            return this.nodeCache.getOrCreate<Node<NodeType>>(compilerNode, () => createNode(nodeToWrapperMappings[compilerNode.kind]));
        else
            return this.nodeCache.getOrCreate<Node<NodeType>>(compilerNode, () => createNode(Node));
    }

    private getSourceFileFromText(filePath: string, sourceText: string): SourceFile {
        const compilerSourceFile = createCompilerSourceFile(filePath, sourceText, this.global.manipulationSettings.getScriptTarget());
        return this.getSourceFile(compilerSourceFile);
    }

    /**
     * Gets a wrapped source file from a compiler source file.
     * @param sourceFile - Compiler source file.
     */
    getSourceFile(compilerSourceFile: ts.SourceFile): SourceFile {
        return this.nodeCache.getOrCreate<SourceFile>(compilerSourceFile, () => {
            const sourceFile = new SourceFile(this.global, compilerSourceFile);
            this.addSourceFileToCache(sourceFile);
            return sourceFile;
        });
    }

    private addSourceFileToCache(sourceFile: SourceFile) {
        this.sourceFileCacheByFilePath.set(sourceFile.getFilePath(), sourceFile);
        this.global.fileSystemWrapper.dequeueDelete(sourceFile.getFilePath());

        // add to list of directories
        const dirPath = sourceFile.getDirectoryPath();
        this.directoryCache.createOrAddIfNotExists(dirPath);
        this.directoryCache.get(dirPath)!._addSourceFile(sourceFile);

        // fire the event
        this.sourceFileAddedEventContainer.fire(sourceFile);
    }

    /**
     * Gets a directory from a path.
     * @param dirPath - Directory path.
     */
    getDirectoryFromPath(dirPath: string) {
        dirPath = this.global.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
        let directory = this.directoryCache.get(dirPath);

        if (directory == null && this.global.fileSystemWrapper.directoryExistsSync(dirPath))
            directory = this.directoryCache.createOrAddIfNotExists(dirPath);

        return directory;
    }

    /**
     * Creates or adds a directory if it doesn't exist.
     * @param dirPath - Directory path.
     */
    createOrAddDirectoryIfNotExists(dirPath: string) {
        return this.directoryCache.createOrAddIfNotExists(dirPath);
    }

    /**
     * Creates a directory.
     * @param dirPath - Directory path.
     */
    createDirectory(dirPath: string) {
        if (this.containsDirectoryAtPath(dirPath) || this.global.fileSystemWrapper.directoryExistsSync(dirPath))
            throw new errors.InvalidOperationError(`A directory already exists at the provided path: ${dirPath}`);
        return this.directoryCache.createOrAddIfNotExists(dirPath);
    }

    /**
     * Gets a directory.
     * @param dirPath - Directory path.
     */
    getDirectory(dirPath: string) {
        return this.directoryCache.get(dirPath);
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
    getType<TType extends ts.Type = TType>(type: TType): Type<TType> {
        if ((type.flags & TypeFlags.TypeParameter) === TypeFlags.TypeParameter)
            return this.getTypeParameter(type as any as ts.TypeParameter) as any as Type<TType>;
        return this.typeCache.getOrCreate(type, () => new Type<TType>(this.global, type));
    }

    /**
     * Gets a wrapped type parameter from a compiler type parameter.
     * @param typeParameter - Compiler type parameter
     */
    getTypeParameter(typeParameter: ts.TypeParameter): TypeParameter {
        return this.typeParameterCache.getOrCreate(typeParameter, () => new TypeParameter(this.global, typeParameter));
    }

    /**
     * Gets a wrapped signature from a compiler signature.
     * @param signature - Compiler signature.
     */
    getSignature(signature: ts.Signature): Signature {
        return this.signatureCache.getOrCreate(signature, () => new Signature(this.global, signature));
    }

    /**
     * Gets a wrapped symbol from a compiler symbol.
     * @param symbol - Compiler symbol.
     */
    getSymbol(symbol: ts.Symbol): Symbol {
        return this.symbolCache.getOrCreate(symbol, () => new Symbol(this.global, symbol));
    }

    /**
     * Gets a wrapped definition info from a compiler object.
     * @param compilerObject - Compiler definition info.
     */
    getDefinitionInfo(compilerObject: ts.DefinitionInfo): DefinitionInfo {
        return this.definitionInfoCache.getOrCreate(compilerObject, () => new DefinitionInfo(this.global, compilerObject));
    }

    /**
     * Gets a wrapped document span from a compiler object.
     * @param compilerObject - Compiler document span.
     */
    getDocumentSpan(compilerObject: ts.DocumentSpan): DocumentSpan {
        return this.documentSpanCache.getOrCreate(compilerObject, () => new DocumentSpan(this.global, compilerObject));
    }

    /**
     * Gets a wrapped referenced entry from a compiler object.
     * @param compilerObject - Compiler referenced entry.
     */
    getReferenceEntry(compilerObject: ts.ReferenceEntry): ReferenceEntry {
        return this.referenceEntryCache.getOrCreate(compilerObject, () => new ReferenceEntry(this.global, compilerObject));
    }

    /**
     * Gets a wrapped referenced symbol from a compiler object.
     * @param compilerObject - Compiler referenced symbol.
     */
    getReferencedSymbol(compilerObject: ts.ReferencedSymbol): ReferencedSymbol {
        return this.referencedSymbolCache.getOrCreate(compilerObject, () => new ReferencedSymbol(this.global, compilerObject));
    }

    /**
     * Gets a wrapped referenced symbol definition info from a compiler object.
     * @param compilerObject - Compiler referenced symbol definition info.
     */
    getReferencedSymbolDefinitionInfo(compilerObject: ts.ReferencedSymbolDefinitionInfo): ReferencedSymbolDefinitionInfo {
        return this.referencedSymbolDefinitionInfoCache.getOrCreate(compilerObject,
            () => new ReferencedSymbolDefinitionInfo(this.global, compilerObject));
    }

    /**
     * Gets a wrapped diagnostic from a compiler diagnostic.
     * @param diagnostic - Compiler diagnostic.
     */
    getDiagnostic(diagnostic: ts.Diagnostic): Diagnostic {
        return this.diagnosticCache.getOrCreate(diagnostic, () => new Diagnostic(this.global, diagnostic));
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
            const oldFilePath = (nodeToReplace as ts.SourceFile).fileName;
            const sourceFile = node! as SourceFile;
            this.removeCompilerNodeFromCache(nodeToReplace);
            sourceFile.replaceCompilerNodeFromFactory(newNode as ts.SourceFile);
            this.nodeCache.set(newNode, sourceFile);
            this.addSourceFileToCache(sourceFile);
        }
        else {
            this.nodeCache.replaceKey(nodeToReplace, newNode);
            if (node != null)
                node.replaceCompilerNodeFromFactory(newNode);
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
            this.directoryCache.get(FileUtils.getDirPath(sourceFile.fileName))!._removeSourceFile(sourceFile.fileName);
            const tsSourceFile = this.sourceFileCacheByFilePath.get(sourceFile.fileName);
            this.sourceFileCacheByFilePath.removeByKey(sourceFile.fileName);
            if (tsSourceFile != null)
                this.sourceFileRemovedEventContainer.fire(tsSourceFile);
        }
    }

    /**
     * Removes the directory from the cache.
     * @param directory - Directory.
     */
    removeDirectoryFromCache(directory: Directory) {
        this.directoryCache.remove(directory.getPath());
    }

    /**
     * Forgets the nodes created in the block.
     * @param block - Block of code to run.
     */
    forgetNodesCreatedInBlock(block: (remember: (...node: Node[]) => void) => (void | Promise<void>)): Promise<void> {
        // can't use the async keyword here because exceptions that happen when doing this synchronously need to be thrown
        this.nodeCache.setForgetPoint();
        let wasPromise = false;
        try {
            const result = block((...nodes) => {
                for (const node of nodes)
                    this.nodeCache.rememberNode(node);
            });

            if (result != null && typeof result.then === "function") {
                wasPromise = true;
                return result.then(() => this.nodeCache.forgetLastPoint());
            }
        } finally {
            if (!wasPromise)
                this.nodeCache.forgetLastPoint();
        }
        return Promise.resolve();
    }
}
