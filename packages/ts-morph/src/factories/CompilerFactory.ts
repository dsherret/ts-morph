import {
  createFileSystemAdapter,
  DocumentRegistry,
  errors,
  EventContainer,
  FileUtils,
  KeyValueCache,
  libFolderInMemoryPath,
  RemoveSourceFileOptions,
  ScriptKind,
  StandardizedFilePath,
  StringUtils,
  SyntaxKind,
  toModuleNameResolver,
  ts,
  TypeFlags,
  WeakCache,
} from "@ts-morph/common";
import {
  CommentClassElement,
  CommentEnumMember,
  CommentObjectLiteralElement,
  CommentStatement,
  CommentTypeElement,
  CompilerCommentNode,
  CompilerNodeToWrappedType,
  DefinitionInfo,
  Diagnostic,
  DiagnosticMessageChain,
  DiagnosticWithLocation,
  DocumentSpan,
  JSDocTagInfo,
  Node,
  ReferencedSymbol,
  ReferencedSymbolDefinitionInfo,
  ReferencedSymbolEntry,
  Signature,
  SourceFile,
  Symbol,
  Type,
  TypeParameter,
} from "../compiler";
import { CommentNodeParser } from "../compiler/ast/utils";
import { Directory } from "../fileSystem";
import { replaceSourceFileForCacheUpdate } from "../manipulation";
import { SourceFileCreateOptions } from "../Project";
import { ProjectContext } from "../ProjectContext";
import { OptionalKind, SourceFileStructure } from "../structures";
import { WriterFunction } from "../types";
import { MakeOptionalUndefined } from "../typings";
import { getTextFromStringOrWriter } from "../utils";
import { DirectoryCache } from "./DirectoryCache";
import { ForgetfulNodeCache } from "./ForgetfulNodeCache";
import { kindToWrapperMappings } from "./kindToWrapperMappings";

/**
 * Factory for creating compiler wrappers.
 * @internal
 */
export class CompilerFactory {
  readonly #context: ProjectContext;
  readonly #sourceFileCacheByFilePath = new Map<StandardizedFilePath, SourceFile>();
  readonly #diagnosticCache = new WeakCache<ts.Diagnostic, Diagnostic>();
  readonly #definitionInfoCache = new WeakCache<ts.DefinitionInfo, DefinitionInfo>();
  readonly #documentSpanCache = new WeakCache<ts.DocumentSpan, DocumentSpan>();
  readonly #diagnosticMessageChainCache = new WeakCache<ts.Diagnostic, DiagnosticMessageChain>();
  readonly #jsDocTagInfoCache = new WeakCache<ts.JSDocTagInfo, JSDocTagInfo>();
  readonly #signatureCache = new WeakCache<ts.Signature, Signature>();
  readonly #symbolCache = new WeakCache<ts.Symbol, Symbol>();
  readonly #referencedSymbolEntryCache = new WeakCache<ts.ReferencedSymbolEntry, ReferencedSymbolEntry>();
  readonly #referencedSymbolCache = new WeakCache<ts.ReferencedSymbol, ReferencedSymbol>();
  readonly #referencedSymbolDefinitionInfoCache = new WeakCache<ts.ReferencedSymbolDefinitionInfo, ReferencedSymbolDefinitionInfo>();
  readonly #typeCache = new WeakCache<ts.Type, Type>();
  readonly #typeParameterCache = new WeakCache<ts.TypeParameter, TypeParameter>();
  readonly #nodeCache = new ForgetfulNodeCache();
  readonly #directoryCache: DirectoryCache;
  readonly #sourceFileAddedEventContainer = new EventContainer<SourceFile>();
  readonly #sourceFileRemovedEventContainer = new EventContainer<SourceFile>();

  readonly documentRegistry: DocumentRegistry;

  /**
   * Initializes a new instance of CompilerFactory.
   * @param context - Project context.
   */
  constructor(context: ProjectContext) {
    // the registry owns the tsgo session: the wasm compiler, the snapshot, and
    // the project every source file, the program and the checker come from
    this.documentRegistry = new DocumentRegistry({
      compilerOptions: getRegistryCompilerOptions(context),
      // so module resolution, `/// <reference>`s and typeRoots see everything
      // ts-morph's file system holds, not only the files pushed into the registry
      fs: createFileSystemAdapter(context.fileSystemWrapper, { encoding: context.compilerOptions.getEncoding() }),
      // the compiler asks this before resolving a specifier itself; absent when
      // the project named no resolution host, which is when it costs nothing
      resolveModuleName: toModuleNameResolver(context.resolutionHost),
      // ts-morph keeps the lib files on its own file system, so the compiler is
      // pointed at them rather than at the copies bundled inside the wasm module
      libFolderPath: context.skipLoadingLibFiles ? undefined : context.libFolderPath ?? libFolderInMemoryPath,
      useCaseSensitiveFileNames: context.fileSystemWrapper.getFileSystem().isCaseSensitive(),
    });
    this.#directoryCache = new DirectoryCache(context);

    // prevent memory leaks when the document registry key changes by just resetting it
    context.compilerOptions.onModified(() => {
      this.documentRegistry.setCompilerOptions(getRegistryCompilerOptions(context));
      // repopulate the cache
      const currentSourceFiles = Array.from(this.#sourceFileCacheByFilePath.values()); // store this to prevent modifying while iterating
      for (const sourceFile of currentSourceFiles) {
        // re-parse the source files in the new document registry, then populate the cache with the new nodes
        replaceSourceFileForCacheUpdate(sourceFile);
      }
    });
    this.#context = context;
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
    return this.#sourceFileCacheByFilePath.keys();
  }

  /**
   * Gets the child directories of a directory.
   * @param dirPath - Directory path.
   */
  getChildDirectoriesOfDirectory(dirPath: StandardizedFilePath) {
    return this.#directoryCache.getChildDirectoriesOfDirectory(dirPath);
  }

  /**
   * Gets the child source files of a directory.
   * @param dirPath - Directory path.
   */
  getChildSourceFilesOfDirectory(dirPath: StandardizedFilePath) {
    return this.#directoryCache.getChildSourceFilesOfDirectory(dirPath);
  }

  /**
   * Occurs when a source file is added to the cache.
   * @param subscription - Subscription.
   * @param subscribe - Whether to subscribe or unsubscribe (default to true).
   */
  onSourceFileAdded(subscription: (sourceFile: SourceFile) => void, subscribe = true) {
    if (subscribe)
      this.#sourceFileAddedEventContainer.subscribe(subscription);
    else
      this.#sourceFileAddedEventContainer.unsubscribe(subscription);
  }

  /**
   * Occurs when a source file is removed from the cache.
   * @param subscription - Subscripton.
   */
  onSourceFileRemoved(subscription: (sourceFile: SourceFile) => void) {
    this.#sourceFileRemovedEventContainer.subscribe(subscription);
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
    options: SourceFileCreateOptions & { markInProject: boolean },
  ) {
    sourceFileText = sourceFileText instanceof Function ? getTextFromStringOrWriter(this.#context.createWriter(), sourceFileText) : sourceFileText || "";
    if (typeof sourceFileText === "string")
      return this.createSourceFileFromText(filePath, sourceFileText, options);

    const writer = this.#context.createWriter();
    const structurePrinter = this.#context.structurePrinterFactory.forSourceFile({
      isAmbient: FileUtils.getExtension(filePath) === ".d.ts",
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
  createSourceFileFromText(filePath: StandardizedFilePath, sourceText: string, options: SourceFileCreateOptions & { markInProject: boolean }) {
    filePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    if (options.overwrite === true)
      return this.#createOrOverwriteSourceFileFromText(filePath, sourceText, options as MakeOptionalUndefined<typeof options>);
    this.throwIfFileExists(filePath, "Did you mean to provide the overwrite option?");
    return this.#createSourceFileFromTextInternal(filePath, sourceText, options as MakeOptionalUndefined<typeof options>);
  }

  /**
   * Throws an error if the file exists in the cache or file system.
   * @param filePath - File path.
   * @param prefixMessage - Message to attach on as a prefix.
   */
  throwIfFileExists(filePath: StandardizedFilePath, prefixMessage?: string) {
    if (!this.containsSourceFileAtPath(filePath) && !this.#context.fileSystemWrapper.fileExistsSync(filePath))
      return;
    prefixMessage = prefixMessage == null ? "" : prefixMessage + " ";
    throw new errors.InvalidOperationError(`${prefixMessage}A source file already exists at the provided file path: ${filePath}`);
  }

  #createOrOverwriteSourceFileFromText(
    filePath: StandardizedFilePath,
    sourceText: string,
    options: { markInProject: boolean; scriptKind: ScriptKind | undefined },
  ) {
    filePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    const existingSourceFile = this.addOrGetSourceFileFromFilePath(filePath, options);
    if (existingSourceFile != null) {
      existingSourceFile.getChildren().forEach(c => c.forget());
      this.replaceCompilerNode(existingSourceFile, this.createCompilerSourceFileFromText(filePath, sourceText));
      return existingSourceFile;
    }

    return this.#createSourceFileFromTextInternal(filePath, sourceText, options);
  }

  /**
   * Gets the source file from the cache by a file path.
   * @param filePath - File path.
   */
  getSourceFileFromCacheFromFilePath(filePath: StandardizedFilePath): SourceFile | undefined {
    filePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    return this.#sourceFileCacheByFilePath.get(filePath);
  }

  /**
   * Gets a source file from a file path. Will use the file path cache if the file exists.
   * @param filePath - File path to get the file from.
   */
  addOrGetSourceFileFromFilePath(filePath: StandardizedFilePath, options: { markInProject: boolean; scriptKind: ScriptKind | undefined }):
    | SourceFile
    | undefined
  {
    filePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    let sourceFile = this.#sourceFileCacheByFilePath.get(filePath);
    if (sourceFile == null) {
      const fileText = this.#context.fileSystemWrapper.readFileIfExistsSync(filePath, this.#context.getEncoding());
      if (fileText != null) {
        this.#context.logger.log(`Loaded file: ${filePath}`);
        sourceFile = this.#createSourceFileFromTextInternal(filePath, fileText, options);
        sourceFile._setIsSaved(true); // source files loaded from the disk are saved to start with
      }
    }

    if (sourceFile != null && options.markInProject)
      sourceFile._markAsInProject();

    return sourceFile;
  }

  /**
   * Gets many source files from their file paths in one go, using the file path
   * cache where it can, and returns them in the order the paths were given —
   * `undefined` where the file system has no such file.
   *
   * Equivalent to calling {@link addOrGetSourceFileFromFilePath} for each path,
   * except that everything read off the file system is parsed as a single batch.
   * The document registry reopens its project once per batch instead of once per
   * file, and reopening costs more the more files the project holds, so this is
   * what keeps adding many files from being quadratic in their number.
   */
  addOrGetSourceFilesFromFilePaths(
    filePaths: readonly StandardizedFilePath[],
    options: { markInProject: boolean; scriptKind: ScriptKind | undefined },
  ): (SourceFile | undefined)[] {
    const standardizedFilePaths = filePaths.map(filePath => this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath));
    const toParse: { filePath: StandardizedFilePath; text: string; hasBom: boolean }[] = [];
    const queued = new Set<StandardizedFilePath>();

    // a path given twice is read and parsed once, the way the same path asked for
    // twice one at a time would be — the second ask found the first in the cache,
    // and nothing reaches the cache until the whole batch has been parsed
    for (const filePath of standardizedFilePaths) {
      if (this.#sourceFileCacheByFilePath.has(filePath) || queued.has(filePath))
        continue;
      queued.add(filePath);
      const fileText = this.#context.fileSystemWrapper.readFileIfExistsSync(filePath, this.#context.getEncoding());
      if (fileText == null)
        continue;
      this.#context.logger.log(`Loaded file: ${filePath}`);
      const hasBom = StringUtils.hasBom(fileText);
      toParse.push({ filePath, text: hasBom ? StringUtils.stripBom(fileText) : fileText, hasBom });
    }

    // kept by the path that was asked for, because the file path cache keys on the
    // name the compiler reports, which a case-insensitive project can spell otherwise
    const parsed = new Map<StandardizedFilePath, SourceFile>();
    const compilerSourceFiles = this.documentRegistry.createOrUpdateSourceFiles(toParse.map(f => ({ fileName: f.filePath, text: f.text })));
    for (let i = 0; i < compilerSourceFiles.length; i++) {
      const sourceFile = this.getSourceFile(compilerSourceFiles[i], options);
      if (toParse[i].hasBom)
        sourceFile._hasBom = true;
      sourceFile._setIsSaved(true); // source files loaded from the disk are saved to start with
      parsed.set(toParse[i].filePath, sourceFile);
    }

    return standardizedFilePaths.map(filePath => {
      const sourceFile = parsed.get(filePath) ?? this.#sourceFileCacheByFilePath.get(filePath);
      if (sourceFile != null && options.markInProject)
        sourceFile._markAsInProject();
      return sourceFile;
    });
  }

  /**
   * Adds a file the compiler resolved into the program but ts-morph was never told about.
   *
   * tsgo resolves modules, `/// <reference>`s and type directives inside the
   * compiler and reports no callback for the files it loads, so a file can be in
   * the program without having gone through the factory. Only files the program
   * already holds are added — this must not turn a lookup into a file load.
   *
   * The file is wrapped straight off the program rather than pushed back into the
   * document registry, because the registry names every file it holds in its
   * tsconfig's `files` and that would make a resolved dependency or a lib file a
   * root of the project. A root is a file the project asked for by name, so the
   * compiler stops reporting it as found while searching node_modules or as a
   * default library — which is what `isFromExternalLibrary` and
   * `isSourceFileDefaultLibrary` answer from.
   */
  addSourceFileFromProgramFromFilePath(filePath: StandardizedFilePath): SourceFile | undefined {
    filePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    const existingSourceFile = this.#sourceFileCacheByFilePath.get(filePath);
    if (existingSourceFile != null)
      return existingSourceFile;
    const compilerSourceFile = this.documentRegistry.getSourceFile(filePath);
    if (compilerSourceFile == null)
      return undefined;
    const sourceFile = this.getSourceFile(compilerSourceFile, { markInProject: false });
    sourceFile._setIsSaved(true); // the compiler read it off the file system
    // The compiler strips a byte order mark from the text it parses and does not
    // report that it did, so the file system is asked instead. Without this the
    // mark is lost the next time the file is saved.
    const fileText = this.#context.fileSystemWrapper.readFileIfExistsSync(filePath, this.#context.getEncoding());
    if (fileText != null && StringUtils.hasBom(fileText))
      sourceFile._hasBom = true;
    return sourceFile;
  }

  /**
   * Gets if the internal cache contains a source file at a specific file path.
   * @param filePath - File path to check.
   */
  containsSourceFileAtPath(filePath: StandardizedFilePath) {
    filePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(filePath);
    return this.#sourceFileCacheByFilePath.has(filePath);
  }

  /**
   * Gets if the internal cache contains a source file with the specified directory path.
   * @param dirPath - Directory path to check.
   */
  containsDirectoryAtPath(dirPath: StandardizedFilePath) {
    dirPath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
    return this.#directoryCache.has(dirPath);
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
    return this.#nodeCache.has(compilerNode);
  }

  /**
   * Gets an existing node from the cache.
   * @param compilerNode - Compiler node.
   */
  getExistingNodeFromCompilerNode(compilerNode: ts.Node) {
    return this.#nodeCache.get(compilerNode);
  }

  /**
   * Gets a wrapped compiler type based on the node's kind.
   * @param node - Node to get the wrapped object from.
   */
  getNodeFromCompilerNode<NodeType extends ts.Node>(compilerNode: NodeType, sourceFile: SourceFile | undefined): CompilerNodeToWrappedType<NodeType> {
    if (compilerNode.kind === SyntaxKind.SourceFile)
      return this.getSourceFile(compilerNode as any as ts.SourceFile, { markInProject: false }) as Node as CompilerNodeToWrappedType<NodeType>;

    return this.#nodeCache.getOrCreate<Node<NodeType>>(compilerNode, () => {
      const node = createNode.call(this);
      initializeNode.call(this, node);
      return node;
    }) as Node as CompilerNodeToWrappedType<NodeType>;

    function createNode(this: CompilerFactory): Node<NodeType> {
      // todo: improve kind to wrapper mappings to handle this scenario
      if (isCommentNode(compilerNode)) {
        if (CommentNodeParser.isCommentStatement(compilerNode))
          return new CommentStatement(this.#context, compilerNode, sourceFile) as any as Node<NodeType>;
        if (CommentNodeParser.isCommentClassElement(compilerNode))
          return new CommentClassElement(this.#context, compilerNode, sourceFile) as any as Node<NodeType>;
        if (CommentNodeParser.isCommentTypeElement(compilerNode))
          return new CommentTypeElement(this.#context, compilerNode, sourceFile) as any as Node<NodeType>;
        if (CommentNodeParser.isCommentObjectLiteralElement(compilerNode))
          return new CommentObjectLiteralElement(this.#context, compilerNode, sourceFile) as any as Node<NodeType>;
        if (CommentNodeParser.isCommentEnumMember(compilerNode))
          return new CommentEnumMember(this.#context, compilerNode, sourceFile) as any as Node<NodeType>;
        return errors.throwNotImplementedForNeverValueError(compilerNode);
      }

      const ctor = kindToWrapperMappings[compilerNode.kind] || Node as any;
      return new ctor(this.#context, compilerNode, sourceFile) as Node<NodeType>;
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

  #createSourceFileFromTextInternal(
    filePath: StandardizedFilePath,
    text: string,
    options: { markInProject: boolean; scriptKind: ScriptKind | undefined },
  ): SourceFile {
    const hasBom = StringUtils.hasBom(text);
    if (hasBom)
      text = StringUtils.stripBom(text);
    const sourceFile = this.getSourceFile(this.createCompilerSourceFileFromText(filePath, text), options);
    if (hasBom)
      sourceFile._hasBom = true;
    return sourceFile;
  }

  /**
   * Parses text as a source file.
   *
   * There is no script kind parameter: the compiler derives the script kind
   * from the file extension and has no way to be told otherwise.
   */
  createCompilerSourceFileFromText(filePath: StandardizedFilePath, text: string): ts.SourceFile {
    return this.documentRegistry.createOrUpdateSourceFile(filePath, text);
  }

  /**
   * Gets a wrapped source file from a compiler source file.
   * @param sourceFile - Compiler source file.
   */
  getSourceFile(compilerSourceFile: ts.SourceFile, options: { markInProject: boolean }): SourceFile {
    let wasAdded = false;
    // check the file path cache first in case this source file object is for an old manipulation (see issue 1164)
    const sourceFile = this.#sourceFileCacheByFilePath.get(compilerSourceFile.fileName as StandardizedFilePath)
      ?? this.#nodeCache.getOrCreate<SourceFile>(compilerSourceFile, () => {
        const createdSourceFile = new SourceFile(this.#context, compilerSourceFile);

        if (!options.markInProject)
          this.#context.inProjectCoordinator.setSourceFileNotInProject(createdSourceFile);

        this.#addSourceFileToCache(createdSourceFile);
        wasAdded = true;
        return createdSourceFile;
      });

    if (options.markInProject)
      sourceFile._markAsInProject();

    if (wasAdded)
      this.#sourceFileAddedEventContainer.fire(sourceFile);

    return sourceFile;
  }

  #addSourceFileToCache(sourceFile: SourceFile) {
    this.#sourceFileCacheByFilePath.set(sourceFile.getFilePath(), sourceFile);
    this.#context.fileSystemWrapper.removeFileDelete(sourceFile.getFilePath());
    this.#directoryCache.addSourceFile(sourceFile);
  }

  /**
   * Gets a directory from a path.
   * @param dirPath - Directory path.
   */
  getDirectoryFromPath(dirPath: StandardizedFilePath, options: { markInProject: boolean }) {
    dirPath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(dirPath);
    let directory = this.#directoryCache.get(dirPath);

    if (directory == null && this.#context.fileSystemWrapper.directoryExistsSync(dirPath))
      directory = this.#directoryCache.createOrAddIfExists(dirPath);

    if (directory != null && options.markInProject)
      directory._markAsInProject();

    return directory;
  }

  /**
   * Creates or adds a directory if it doesn't exist.
   * @param dirPath - Directory path.
   */
  createDirectoryOrAddIfExists(dirPath: StandardizedFilePath, options: { markInProject: boolean }) {
    const directory = this.#directoryCache.createOrAddIfExists(dirPath);
    if (directory != null && options.markInProject)
      directory._markAsInProject();
    return directory;
  }

  /**
   * Gets a directory.
   * @param dirPath - Directory path.
   */
  getDirectoryFromCache(dirPath: StandardizedFilePath) {
    return this.#directoryCache.get(dirPath);
  }

  /**
   * Gets a directory from the cache, but only if it's in the cache.
   * @param dirPath - Directory path.
   */
  getDirectoryFromCacheOnlyIfInCache(dirPath: StandardizedFilePath) {
    return this.#directoryCache.has(dirPath)
      ? this.#directoryCache.get(dirPath)
      : undefined;
  }

  /**
   * Gets all the directories iterated by depth.
   */
  getDirectoriesByDepth() {
    return this.#directoryCache.getAllByDepth();
  }

  /**
   * Gets the directories without a parent.
   */
  getOrphanDirectories() {
    return this.#directoryCache.getOrphans();
  }

  /**
   * Gets a wrapped type from a compiler type.
   * @param type - Compiler type.
   */
  getType<TType extends ts.Type>(type: TType): Type<TType> {
    if ((type.flags & TypeFlags.TypeParameter) === TypeFlags.TypeParameter)
      return this.getTypeParameter(type as any as ts.TypeParameter) as any as Type<TType>;
    return this.#typeCache.getOrCreate(type, () => new Type<TType>(this.#context, type));
  }

  /**
   * Gets a wrapped type parameter from a compiler type parameter.
   * @param typeParameter - Compiler type parameter
   */
  getTypeParameter(typeParameter: ts.TypeParameter): TypeParameter {
    return this.#typeParameterCache.getOrCreate(typeParameter, () => new TypeParameter(this.#context, typeParameter));
  }

  /**
   * Gets a wrapped signature from a compiler signature.
   * @param signature - Compiler signature.
   */
  getSignature(signature: ts.Signature): Signature {
    return this.#signatureCache.getOrCreate(signature, () => new Signature(this.#context, signature));
  }

  /**
   * Gets a wrapped symbol from a compiler symbol.
   * @param symbol - Compiler symbol.
   */
  getSymbol(symbol: ts.Symbol): Symbol {
    return this.#symbolCache.getOrCreate(symbol, () => new Symbol(this.#context, symbol));
  }

  /**
   * Gets a wrapped definition info from a compiler object.
   * @param compilerObject - Compiler definition info.
   */
  getDefinitionInfo(compilerObject: ts.DefinitionInfo): DefinitionInfo {
    return this.#definitionInfoCache.getOrCreate(compilerObject, () => new DefinitionInfo(this.#context, compilerObject));
  }

  /**
   * Gets a wrapped document span from a compiler object.
   * @param compilerObject - Compiler document span.
   */
  getDocumentSpan(compilerObject: ts.DocumentSpan): DocumentSpan {
    return this.#documentSpanCache.getOrCreate(compilerObject, () => new DocumentSpan(this.#context, compilerObject));
  }

  /**
   * Gets a wrapped referenced entry from a compiler object.
   * @param compilerObject - Compiler referenced entry.
   */
  getReferencedSymbolEntry(compilerObject: ts.ReferencedSymbolEntry): ReferencedSymbolEntry {
    return this.#referencedSymbolEntryCache.getOrCreate(compilerObject, () => new ReferencedSymbolEntry(this.#context, compilerObject));
  }

  /**
   * Gets a wrapped referenced symbol from a compiler object.
   * @param compilerObject - Compiler referenced symbol.
   */
  getReferencedSymbol(compilerObject: ts.ReferencedSymbol): ReferencedSymbol {
    return this.#referencedSymbolCache.getOrCreate(compilerObject, () => new ReferencedSymbol(this.#context, compilerObject));
  }

  /**
   * Gets a wrapped referenced symbol definition info from a compiler object.
   * @param compilerObject - Compiler referenced symbol definition info.
   */
  getReferencedSymbolDefinitionInfo(compilerObject: ts.ReferencedSymbolDefinitionInfo): ReferencedSymbolDefinitionInfo {
    return this.#referencedSymbolDefinitionInfoCache.getOrCreate(compilerObject, () => new ReferencedSymbolDefinitionInfo(this.#context, compilerObject));
  }

  /**
   * Gets a wrapped diagnostic from a compiler diagnostic.
   * @param diagnostic - Compiler diagnostic.
   */
  getDiagnostic(diagnostic: ts.Diagnostic): Diagnostic {
    return this.#diagnosticCache.getOrCreate(diagnostic, () => {
      if (diagnostic.fileName != null)
        return new DiagnosticWithLocation(this.#context, diagnostic as ts.DiagnosticWithLocation);
      return new Diagnostic(this.#context, diagnostic);
    });
  }

  /**
   * Gets a wrapped diagnostic with location from a compiler diagnostic.
   * @param diagnostic - Compiler diagnostic.
   */
  getDiagnosticWithLocation(diagnostic: ts.DiagnosticWithLocation): DiagnosticWithLocation {
    return this.#diagnosticCache.getOrCreate(diagnostic, () => new DiagnosticWithLocation(this.#context, diagnostic));
  }

  /**
   * Gets a wrapped diagnostic message chain from a compiler diagnostic message chain.
   * @param diagnosticMessageChain - Compiler diagnostic message chain.
   */
  getDiagnosticMessageChain(compilerObject: ts.Diagnostic): DiagnosticMessageChain {
    return this.#diagnosticMessageChainCache.getOrCreate(compilerObject, () => new DiagnosticMessageChain(compilerObject));
  }

  /**
   * Gets a warpped JS doc tag info from a compiler object.
   * @param jsDocTagInfo - Compiler object.
   */
  getJSDocTagInfo(jsDocTagInfo: ts.JSDocTagInfo): JSDocTagInfo {
    return this.#jsDocTagInfoCache.getOrCreate(jsDocTagInfo, () => new JSDocTagInfo(jsDocTagInfo));
  }

  /**
   * Replaces a compiler node in the cache.
   * @param oldNode - Old node to remove.
   * @param newNode - New node to use.
   */
  replaceCompilerNode(oldNode: ts.Node | Node, newNode: ts.Node) {
    const nodeToReplace = oldNode instanceof Node ? oldNode.compilerNode : oldNode;
    const node = oldNode instanceof Node ? oldNode : this.#nodeCache.get(oldNode);

    if (nodeToReplace.kind === SyntaxKind.SourceFile && (nodeToReplace as ts.SourceFile).fileName !== (newNode as ts.SourceFile).fileName) {
      const sourceFile = node! as SourceFile;
      // the file is moving off this path, so the compiler drops what it holds for
      // it rather than reading the copy still sitting on the file system
      this.#removeCompilerNodeFromCache(nodeToReplace, { discardContents: true });
      sourceFile._replaceCompilerNodeFromFactory(newNode as ts.SourceFile);
      this.#nodeCache.set(newNode, sourceFile);
      this.#addSourceFileToCache(sourceFile);
      this.#sourceFileAddedEventContainer.fire(sourceFile);
    } else {
      this.#nodeCache.replaceKey(nodeToReplace, newNode);
      if (node != null)
        node._replaceCompilerNodeFromFactory(newNode);
    }
  }

  /**
   * Removes a node from the cache.
   * @param node - Node to remove.
   * @param options - How a source file's removal is reported to the compiler.
   */
  removeNodeFromCache(node: Node, options?: RemoveSourceFileOptions) {
    this.#removeCompilerNodeFromCache(node.compilerNode, options);
  }

  /**
   * Removes a compiler node from the cache.
   * @param compilerNode - Compiler node to remove.
   * @param options - How a source file's removal is reported to the compiler.
   */
  #removeCompilerNodeFromCache(compilerNode: ts.Node, options?: RemoveSourceFileOptions) {
    this.#nodeCache.removeByKey(compilerNode);

    if (compilerNode.kind === SyntaxKind.SourceFile) {
      const sourceFile = compilerNode as ts.SourceFile;
      const standardizedFilePath = this.#context.fileSystemWrapper.getStandardizedAbsolutePath(sourceFile.fileName);
      this.#directoryCache.removeSourceFile(standardizedFilePath);
      const wrappedSourceFile = this.#sourceFileCacheByFilePath.get(standardizedFilePath);
      this.#sourceFileCacheByFilePath.delete(standardizedFilePath);
      this.documentRegistry.removeSourceFile(standardizedFilePath, options);
      if (wrappedSourceFile != null)
        this.#sourceFileRemovedEventContainer.fire(wrappedSourceFile);
    }
  }

  /**
   * Adds the specified directory to the cache.
   * @param directory - Directory
   */
  addDirectoryToCache(directory: Directory) {
    this.#directoryCache.addDirectory(directory);
  }

  /**
   * Removes the directory from the cache.
   * @param dirPath - Directory path.
   */
  removeDirectoryFromCache(dirPath: StandardizedFilePath) {
    this.#directoryCache.remove(dirPath);
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
  forgetNodesCreatedInBlock<T = void>(block: (remember: (...node: Node[]) => void) => T | Promise<T>): Promise<T> | T {
    // can't use the async keyword here because exceptions that happen when doing this synchronously need to be thrown
    this.#nodeCache.setForgetPoint();
    let wasPromise = false;
    let result: T | Promise<T>;
    try {
      result = block((...nodes) => {
        for (const node of nodes)
          this.#nodeCache.rememberNode(node);
      });

      if (Node.isNode(result))
        this.#nodeCache.rememberNode(result);

      if (isPromise(result)) {
        wasPromise = true;
        return result.then(value => {
          if (Node.isNode(value))
            this.#nodeCache.rememberNode(value);

          this.#nodeCache.forgetLastPoint();
          return value;
        });
      }
    } finally {
      if (!wasPromise)
        this.#nodeCache.forgetLastPoint();
    }
    return result;

    function isPromise<TValue>(value: unknown): value is Promise<TValue> {
      return value != null && typeof (value as any).then === "function";
    }
  }
}

/**
 * The compiler options the tsgo project is opened with.
 *
 * `skipLoadingLibFiles` works by not putting the lib files where the compiler
 * looks, which tsgo makes impossible — its lib files are embedded in the wasm
 * module and load whatever the file system holds. `noLib` is the option that has
 * the same effect, so the translation happens here rather than being exposed on
 * the project's own compiler options.
 */
function getRegistryCompilerOptions(context: ProjectContext): ts.CompilerOptions {
  const compilerOptions = context.compilerOptions.get();
  if (context.skipLoadingLibFiles)
    compilerOptions.noLib = true;
  return compilerOptions;
}
