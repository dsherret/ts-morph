/**
 * Source file storage backed by tsgo.
 *
 * Replaces the `ts.DocumentRegistry` / `IScriptSnapshot` model, which has no
 * tsgo counterpart. ts-morph used to hand the compiler a text snapshot and get a
 * parsed file straight back; tsgo owns parsing and the file system, so text is
 * written into an in-memory file system, the session is told what changed, and
 * the parsed file is read back off the project's program.
 *
 * Files are supplied as strings, and compiler options are set for the registry
 * as a whole rather than per call, because the compiler resolves them per
 * project.
 */
import type { CompilerOptions } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/compilerOptions.js";
import { createVirtualFileSystem, type FileSystem } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/fs.js";
import type { ModuleNameResolver } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/options.js";
import type { API, Project, Snapshot } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/api.js";
import { createWasmAPI } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/wasm/api.js";
import type { SourceFile } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/index.js";
import { JsxEmit } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/jsxEmit.enum.js";
import { ModuleDetectionKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleDetectionKind.enum.js";
import { ModuleKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleKind.enum.js";
import { ModuleResolutionKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleResolutionKind.enum.js";
import { NewLineKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/newLineKind.enum.js";
import { ScriptTarget } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/scriptTarget.enum.js";

/** The tsconfig every file in the registry belongs to. */
const configFilePath = "/tsconfig.json";

/**
 * How many superseded snapshots the checker handed objects out from are kept
 * alive — see DocumentRegistry#retire.
 *
 * This is exactly how many edits a `Type`, `Symbol` or `Signature` taken before
 * them keeps working across, so it is observable and not a tuning knob: at 0 the
 * first edit costs the caller `getProperties`, `getMembers`, `getExports`,
 * `getDeclarations`, `getFlags`, `getSymbol`, `getCallSignatures` and a signature's
 * `getParameters` and `getDeclaration`, and the failure stops even being a stale
 * handle the compiler can name. (Only the requests that route back through the
 * current checker — `getText`, `getApparentType`, `getNonNullableType`,
 * `getBaseTypes`, `Symbol#getDeclaredType` — fail on the first edit whatever this
 * is.) Against that, two retained programs were not measurable over run-to-run
 * variance: 500 files edited 24 times, asking the checker each time, sat at
 * ~199MB rss either way.
 */
const retiredSnapshotLimit = 2;

export interface DocumentRegistryOptions {
  /**
   * Resolves module specifiers in place of the compiler. Nothing is asked of it
   * when absent, which is also when the compiler pays nothing for it.
   */
  resolveModuleName?: ModuleNameResolver;
  /** Compiler options for the registry's project. */
  compilerOptions?: CompilerOptions;
  /** Files to seed the registry with, as path → contents. */
  files?: Record<string, string>;
  /**
   * File system the compiler resolves through for anything the registry does not
   * hold — node_modules, `/// <reference>` targets, and files a tsconfig glob
   * would pull in. Defaults to nothing being reachable beyond the registry.
   */
  fs?: FileSystem;
  /**
   * Directory the default lib files are read from, through {@link fs}. tsgo
   * carries its own copies inside the wasm module and reads those unless a
   * folder is named here, which is how ts-morph's `libFolderPath` — and its
   * in-memory `/node_modules/typescript/lib` default — reach the compiler.
   */
  libFolderPath?: string;
  /**
   * Whether the file system distinguishes case. Defaults to true; a project on a
   * Windows or macOS disk says false so the compiler resolves a differently cased
   * module specifier the way that disk does.
   */
  useCaseSensitiveFileNames?: boolean;
}

export interface RemoveSourceFileOptions {
  /**
   * Whether the file's contents leave with it, rather than the file system's copy
   * of the path speaking for it again. Defaults to false.
   */
  discardContents?: boolean;
}

export class DocumentRegistry {
  readonly #fs: FileSystem;
  readonly #baseFs: FileSystem | undefined;
  readonly #api: API;
  readonly #versions = new Map<string, number>();
  readonly #retiredSnapshots: Snapshot[] = [];
  readonly #pendingChanged = new Set<string>();
  readonly #pendingCreated = new Set<string>();
  readonly #pendingDeleted = new Set<string>();
  readonly #pendingRootsAdded = new Set<string>();
  readonly #pendingRootsRemoved = new Set<string>();
  #compilerOptions: CompilerOptions;
  #snapshot: Snapshot | undefined;
  #project: Project | undefined;
  /**
   * The deepest directory holding every non-declaration file the registry has, as path
   * segments — the `rootDir` the config carries, kept as files arrive rather than
   * recomputed from the whole list. See toConfigCompilerOptions for why it is written.
   */
  #commonDirectoryParts: string[] | undefined;
  #configStale = false;
  #checkerUsed = false;
  #disposed = false;

  constructor(options: DocumentRegistryOptions = {}) {
    this.#compilerOptions = options.compilerOptions ?? {};
    for (const fileName of Object.keys(options.files ?? {})) {
      this.#versions.set(fileName, 0);
      this.#pendingRootsAdded.add(fileName);
      this.#addToCommonDirectory(fileName);
    }
    // the config is written below rather than left for the first flush to write
    this.#configStale = false;
    this.#fs = createVirtualFileSystem({
      [configFilePath]: this.#configText(),
      ...options.files,
    });
    this.#baseFs = options.fs;
    this.#api = createWasmAPI({
      cwd: "/",
      fs: options.fs == null ? this.#fs : overlay(this.#fs, options.fs),
      resolveModuleName: options.resolveModuleName,
      defaultLibraryPath: options.libFolderPath,
      useCaseSensitiveFileNames: options.useCaseSensitiveFileNames,
    });
  }

  /**
   * Adds a file or replaces its contents, and returns the parsed file. The
   * returned node tree is only valid until the next change to the same file.
   */
  createOrUpdateSourceFile(fileName: string, text: string): SourceFile {
    return this.createOrUpdateSourceFiles([{ fileName, text }])[0];
  }

  /**
   * Adds or replaces many files at once, and returns the parsed files in the order
   * they were given.
   *
   * Everything the batch touches is reported as a single change, so it costs one
   * reopen however many files it names — see {@link setSourceFileText} for why that
   * is what matters.
   */
  createOrUpdateSourceFiles(files: readonly { fileName: string; text: string }[]): SourceFile[] {
    this.#assertNotDisposed();
    if (files.length === 0)
      return [];
    this.#write(files);
    return files.map(file => this.getSourceFileOrThrow(file.fileName));
  }

  /**
   * Adds a file or replaces its contents without parsing it.
   *
   * Asking for the parsed file is what forces the project open, and a reopen costs
   * time proportional to how many files the project holds — so adding files one at
   * a time through {@link createOrUpdateSourceFile} is quadratic in their number.
   * Nothing here reopens anything: the change waits with the others until the next
   * read of {@link project}, {@link program}, {@link checker} or
   * {@link getSourceFile}, so a run of these costs one reopen between them rather
   * than one each. The file is in the project from that read onwards, and a caller
   * that never takes one pays for no reopen at all.
   */
  setSourceFileText(fileName: string, text: string): void {
    this.#assertNotDisposed();
    this.#write([{ fileName, text }]);
  }

  /**
   * Replaces the compiler options the registry's project is opened with.
   *
   * The options live in the synthetic tsconfig, so changing them rewrites it and
   * reopens the project — every file is reparsed against the new options — from the
   * next read of the project.
   */
  setCompilerOptions(compilerOptions: CompilerOptions): void {
    this.#assertNotDisposed();
    this.#compilerOptions = compilerOptions;
    this.#configStale = true;
  }

  /**
   * Removes a file from the registry.
   *
   * The registry's copy of a file is what the compiler reads, so dropping it hands
   * the path back to the wider file system: whatever is there now speaks for it.
   * That is what keeps an import of a file the caller merely stopped tracking
   * resolving. Pass `discardContents` when the caller is vacating the path instead
   * — deleting the file, or putting a different one there — because then whatever
   * the file system still has is stale and must not be read back.
   */
  removeSourceFile(fileName: string, options: RemoveSourceFileOptions = {}): void {
    this.#assertNotDisposed();
    if (!this.#versions.has(fileName))
      return;
    // before the file goes, so a change still waiting for it is applied while it is
    // still there to be applied to — see #flushPending
    this.#flushPending([fileName]);
    this.#versions.delete(fileName);
    this.#fs.removeFile!(fileName);
    // a file the project was never told about leaves without being dropped from it: the
    // only place it had reached is the pending list, which has not been drained yet
    if (!this.#pendingRootsAdded.delete(fileName))
      this.#pendingRootsRemoved.add(fileName);
    this.#recomputeCommonDirectory();
    this.#queueChange(options.discardContents ? { deleted: [fileName] } : { changed: [fileName] });
  }

  /** Returns the parsed file, or `undefined` when it is not in the project. */
  getSourceFile(fileName: string): SourceFile | undefined {
    return this.#getProject().program.getSourceFile(fileName);
  }

  getSourceFileOrThrow(fileName: string): SourceFile {
    const sourceFile = this.getSourceFile(fileName);
    if (sourceFile == null)
      throw new Error(`Could not find source file: ${fileName}`);
    return sourceFile;
  }

  /**
   * The number of times a file's contents have been replaced, or `undefined`
   * when the registry does not know the file. A file that has never been edited
   * is version "0", so an unknown file must not report one.
   */
  getSourceFileVersion(fileName: string): string | undefined {
    const version = this.#versions.get(fileName);
    return version === undefined ? undefined : String(version);
  }

  /**
   * The project the registry's files belong to.
   *
   * tsgo hangs the language service operations — formatting, organize imports,
   * rename, definitions, implementations, code fixes — off the project, so this
   * is the session seam callers reach them through.
   */
  get project(): Project {
    return this.#getProject();
  }

  /** The project's checker, for type and symbol queries. */
  get checker() {
    const project = this.#getProject();
    // types, symbols and signatures are handles into the snapshot that produced
    // them, so the snapshot has to outlive the next edit — see #retire. The mark
    // goes on after the project is resolved, because resolving it may be what
    // opens the snapshot being marked.
    this.#checkerUsed = true;
    return project.checker;
  }

  /** The project's program, for diagnostics and file enumeration. */
  get program() {
    return this.#getProject().program;
  }

  dispose(): void {
    if (this.#disposed)
      return;
    this.#disposed = true;
    this.#snapshot = undefined;
    this.#retiredSnapshots.length = 0;
    this.#project = undefined;
    this.#versions.clear();
    this.#pendingChanged.clear();
    this.#pendingCreated.clear();
    this.#pendingDeleted.clear();
    this.#pendingRootsAdded.clear();
    this.#pendingRootsRemoved.clear();
    this.#api.close();
  }

  /**
   * Writes files into the registry's file system and reports what changed.
   *
   * A file the wider file system already has is reported as changed rather than
   * created, because the compiler may have read that copy already — resolving an
   * import of it, say. Told the file was created it would keep the tree it parsed,
   * and the file system's stale text would go on speaking for the contents just
   * written. #versions cannot answer this on its own: it tracks only the files the
   * registry itself holds.
   *
   * The two are not otherwise interchangeable — a created path also invalidates the
   * failed lookups that named it, where a changed one does not — and neither says
   * anything about whether the file is a root of the project, which is reported
   * separately (see #flush).
   */
  #write(files: readonly { fileName: string; text: string }[]): void {
    // before the text changes, so a change still waiting for one of these paths is
    // applied against the text it was reported for — see #flushPending
    this.#flushPending(files.map(file => file.fileName));

    const created = new Set<string>();
    const changed = new Set<string>();
    for (const { fileName, text } of files) {
      if (!this.#versions.has(fileName)) {
        this.#pendingRootsAdded.add(fileName);
        this.#addToCommonDirectory(fileName);
        if (this.#baseFs?.fileExists?.(fileName) ?? false)
          changed.add(fileName);
        else
          created.add(fileName);
      } else if (!created.has(fileName)) { // a file the batch itself created is not also a change
        changed.add(fileName);
      }
      this.#fs.writeFile!(fileName, text);
      this.#versions.set(fileName, (this.#versions.get(fileName) ?? -1) + 1);
    }

    this.#queueChange({
      ...created.size > 0 ? { created: [...created] } : {},
      ...changed.size > 0 ? { changed: [...changed] } : {},
    });
  }

  /**
   * Records a file change for the next time the project is opened.
   *
   * Changes are held rather than applied because opening the project is the whole
   * cost of a change — see setSourceFileText — and a caller that makes several
   * before reading anything should only pay it once. Nothing observes the registry
   * without going through #getProject, so holding them is not visible beyond
   * costing less.
   *
   * Callers apply what is waiting for a path before changing it again — see
   * #flushPending — so each set holds a path at most once and the kinds stay
   * disjoint. That matters because created-then-changed and deleted-then-created
   * are neither of the two things they are made of, and coalescing them would have
   * to decide which. It never comes up in a run of adds, which is the case this is
   * for.
   *
   * Which files are roots of the project is held separately, in #pendingRootsAdded and
   * #pendingRootsRemoved: a file can join the registry reported as changed rather than
   * created, and leave it without being reported as deleted, so the two questions do
   * not have the same answer.
   */
  #queueChange(changes: { changed?: string[]; created?: string[]; deleted?: string[] }): void {
    for (const path of changes.changed ?? [])
      this.#pendingChanged.add(path);
    for (const path of changes.created ?? [])
      this.#pendingCreated.add(path);
    for (const path of changes.deleted ?? [])
      this.#pendingDeleted.add(path);
  }

  /**
   * Applies the waiting changes when any of `paths` is among them.
   *
   * Called before a path a change is already waiting for is written or removed
   * again, because what the compiler is told about a change has to describe what it
   * finds when it looks: told a file was created and then handed a file system
   * without it, or told one was deleted and handed a file system that still has it,
   * it is being asked to believe two things at once. Applying the older change
   * first is what keeps each report true of the moment it is made.
   */
  #flushPending(paths: readonly string[]): void {
    if (paths.some(path => this.#pendingChanged.has(path) || this.#pendingCreated.has(path) || this.#pendingDeleted.has(path)))
      this.#flush();
  }

  /**
   * Applies the waiting changes and reopens the project on the resulting snapshot.
   *
   * The changes and the reopen are one call so they cost one snapshot rather than
   * two, and the snapshot they replace is let go of — see #retire for when that
   * means disposing it. Letting go happens after the new snapshot exists so the
   * source file cache can first carry unchanged files' entries across; that is what
   * preserves node identity for every file the changes did not touch.
   *
   * Root files travel as a delta rather than through the config — see #configText —
   * so a create writes nothing that grows with the project and the compiler keeps the
   * command line it already parsed. The delta rides on the same call as the file
   * changes so that a file's contents and its membership land in the same snapshot.
   */
  #flush(): void {
    if (
      this.#pendingChanged.size === 0 && this.#pendingCreated.size === 0 && this.#pendingDeleted.size === 0
      && this.#pendingRootsAdded.size === 0 && this.#pendingRootsRemoved.size === 0 && !this.#configStale
    ) {
      return;
    }
    const changed = [...this.#pendingChanged];
    const created = [...this.#pendingCreated];
    const deleted = [...this.#pendingDeleted];
    const rootsAdded = [...this.#pendingRootsAdded];
    const rootsRemoved = [...this.#pendingRootsRemoved];
    const configStale = this.#configStale;
    // emptied before the project opens, because opening it is what reads the
    // registry back and a change applied twice is not the same change
    this.#pendingChanged.clear();
    this.#pendingCreated.clear();
    this.#pendingDeleted.clear();
    this.#pendingRootsAdded.clear();
    this.#pendingRootsRemoved.clear();
    this.#configStale = false;

    if (configStale) {
      this.#fs.writeFile!(configFilePath, this.#configText());
      changed.push(configFilePath);
    }
    this.#openProject({
      fileChanges: {
        ...changed.length > 0 ? { changed } : {},
        ...created.length > 0 ? { created } : {},
        ...deleted.length > 0 ? { deleted } : {},
      },
      ...rootsAdded.length > 0 || rootsRemoved.length > 0
        ? {
          rootFileChanges: [{
            project: configFilePath,
            ...rootsAdded.length > 0 ? { added: rootsAdded } : {},
            ...rootsRemoved.length > 0 ? { removed: rootsRemoved } : {},
          }],
        }
        : {},
      openProject: configFilePath,
    });
  }

  /**
   * The registry's tsconfig, which holds the compiler options and no files.
   *
   * The `files` list is empty and stays empty: root files are named for the project
   * over the API instead, which is what keeps creating a file from rewriting a config
   * that grows with the project. The key still has to be *present*, because a config
   * with neither `files` nor `include` globs every file it can reach and picks them up
   * by extension priority, which drops `a.d.ts` and `a.js` on the floor whenever `a.ts`
   * is also present. ts-morph's contract is that a file the caller added is in the
   * project whatever else shares its stem, and a root named over the API is taken
   * verbatim — no glob, no extension priority — so the contract now holds by
   * construction rather than by naming every file.
   *
   * Options are read out of a config file whether or not the caller wrote one,
   * which settles the few compiler options whose validity turns on that: an
   * `incremental` without a `tsBuildInfoFile` is reported only when there is no
   * config file to hold the build info beside, so the compiler accepts it here
   * where a bare options object would not.
   */
  #configText(): string {
    const compilerOptions = toConfigCompilerOptions(this.#compilerOptions, commonDirectoryOf(this.#commonDirectoryParts));
    return JSON.stringify({ compilerOptions: { allowJs: true, ...compilerOptions }, files: [] });
  }

  /**
   * Folds a file the registry has just taken into the common directory, and marks the
   * config stale when that moves it.
   *
   * The common directory only ever shortens as files arrive, so over a run of creates
   * the config is rewritten at most once per directory level of the first file however
   * many files there are — and in the usual shape, where everything sits under one
   * directory, exactly once.
   */
  #addToCommonDirectory(fileName: string): void {
    if (declarationFileNameRegex.test(fileName))
      return;
    const parts = narrowCommonDirectory(this.#commonDirectoryParts, fileName);
    if (parts === this.#commonDirectoryParts)
      return;
    this.#commonDirectoryParts = parts;
    // a rootDir the caller set is what the config carries, so nothing here moves it
    if (this.#compilerOptions.rootDir == null)
      this.#configStale = true;
  }

  /**
   * Works the common directory out again over every file the registry still holds.
   *
   * Removing a file can only lengthen it, which no fold over the remaining files can
   * do, so this is the one case that costs the whole list. That is what it cost before
   * every change, and a removal takes the compiler's incremental path away regardless.
   */
  #recomputeCommonDirectory(): void {
    const before = commonDirectoryOf(this.#commonDirectoryParts);
    let parts: string[] | undefined;
    for (const fileName of this.#versions.keys()) {
      if (!declarationFileNameRegex.test(fileName))
        parts = narrowCommonDirectory(parts, fileName);
    }
    this.#commonDirectoryParts = parts;
    if (this.#compilerOptions.rootDir == null && commonDirectoryOf(parts) !== before)
      this.#configStale = true;
  }

  #getProject(): Project {
    this.#assertNotDisposed();
    this.#flush();
    if (this.#project == null)
      this.#openProject({ openProject: configFilePath });
    return this.#project!;
  }

  #openProject(params: {
    fileChanges?: { changed?: string[]; created?: string[]; deleted?: string[] };
    rootFileChanges?: { project: string; added?: string[]; removed?: string[] }[];
    openProject: string;
  }): void {
    const previous = this.#snapshot;
    const previousHandedOutObjects = this.#checkerUsed;
    this.#checkerUsed = false;
    const snapshot = this.#api.updateSnapshot(params);
    this.#snapshot = snapshot;
    if (previous != null)
      this.#retire(previous, previousHandedOutObjects);
    const project = snapshot.getProject(configFilePath);
    if (project == null)
      throw new Error(`Could not open the project at ${configFilePath}`);
    this.#project = project;
  }

  /**
   * Lets go of a snapshot an edit has superseded.
   *
   * A snapshot the checker was never asked anything can go straight away: nothing
   * outside the registry refers to it. One the checker did answer from is a
   * different matter — a type, symbol or signature is a handle into the snapshot
   * that produced it, and the caller's `Type` object stays usable across an edit
   * in ts-morph, so the snapshot behind it has to stay too. Those are kept in
   * order and the oldest is dropped once there are more than
   * {@link retiredSnapshotLimit} of them, which bounds what an editing loop can
   * pin: every snapshot holds a program and a checker on the server, and disposal
   * is the only thing that ever releases them.
   */
  #retire(snapshot: Snapshot, handedOutObjects: boolean): void {
    if (!handedOutObjects) {
      snapshot.dispose();
      return;
    }
    this.#retiredSnapshots.push(snapshot);
    while (this.#retiredSnapshots.length > retiredSnapshotLimit)
      this.#retiredSnapshots.shift()!.dispose();
  }

  #assertNotDisposed(): void {
    if (this.#disposed)
      throw new Error("DocumentRegistry has been disposed.");
  }
}

/**
 * Layers the registry's own files over a wider file system.
 *
 * The registry holds the text of every file ts-morph has given it, which for an
 * unsaved manipulation is newer than anything on the file system, so its answers
 * always win. Everything else — node_modules, referenced files, whatever else the
 * compiler goes looking for — falls through to `base`, which in turn answers
 * `undefined` for the paths tsgo owns itself.
 */
function overlay(registry: FileSystem, base: FileSystem): FileSystem {
  return {
    fileExists: path => registry.fileExists!(path) || base.fileExists?.(path),
    directoryExists: path => registry.directoryExists!(path) || base.directoryExists?.(path),
    realpath: path => registry.fileExists!(path) ? path : base.realpath?.(path),
    readFile: path => registry.fileExists!(path) ? registry.readFile!(path) : base.readFile?.(path),
    writeFile: (path, content) => base.writeFile?.(path, content),
    removeFile: path => registry.removeFile?.(path),
    getAccessibleEntries: dirPath => {
      const own = registry.getAccessibleEntries!(dirPath);
      const other = base.getAccessibleEntries?.(dirPath);
      if (own == null)
        return other;
      if (other == null)
        return own;
      return {
        files: [...new Set([...own.files, ...other.files])],
        directories: [...new Set([...own.directories, ...other.directories])],
      };
    },
  };
}

/**
 * Converts compiler options into what a tsconfig's `compilerOptions` accepts.
 *
 * A tsconfig is JSON, so the enum-valued options have to be written as the names
 * the config parser knows — handed a number it reports "requires a value of type
 * enum" and drops the option. ts-morph's own bookkeeping keys are dropped too:
 * they are not compiler options and the parser rejects them as unknown.
 */
function toConfigCompilerOptions(compilerOptions: CompilerOptions, commonDirectory: string | undefined): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let configFilePath: string | undefined;
  for (const [name, value] of Object.entries(compilerOptions)) {
    if (name === "configFilePath" && typeof value === "string")
      configFilePath = value;
    if (value === undefined || internalOptionNames.has(name))
      continue;
    if (name === "lib" && Array.isArray(value)) {
      result[name] = value.map(toConfigLibName);
      continue;
    }
    const enumNames = enumOptionNames[name];
    if (enumNames == null) {
      result[name] = value;
      continue;
    }
    const enumName = typeof value === "number" ? enumNames[value] : value;
    if (enumName != null)
      result[name] = enumName;
  }

  // Type reference directives resolve against the directory of the config that
  // asked for them, and the registry's config is not the caller's — so where the
  // caller had one, its default type roots are written out explicitly.
  if (result.typeRoots == null && configFilePath != null)
    result.typeRoots = getDefaultTypeRoots(configFilePath);

  // The config's own directory is the compiler's common source directory unless a
  // rootDir says otherwise, and the registry's config always sits at the root. An
  // explicit rootDir keeps emit output where it would be without a config file.
  if (result.rootDir == null && commonDirectory != null)
    result.rootDir = commonDirectory;
  return result;
}

/**
 * The name a tsconfig's `lib` list uses for a library.
 *
 * `CompilerOptions#lib` holds library *file* names — `lib.es2015.d.ts` — which is
 * the form the `typescript` package produced and the form ts-morph's own typings
 * document, but a tsconfig's `lib` is an enum of short names and tsgo's config
 * parser rejects anything else. Anything that is not a library file name is
 * passed through, so a short name given directly still works and an unknown one
 * is still reported.
 */
function toConfigLibName(lib: unknown): unknown {
  if (typeof lib !== "string")
    return lib;
  const match = /^lib\.(.+)\.d\.ts$/i.exec(lib);
  return match == null ? lib : match[1].toLowerCase();
}

/**
 * The `node_modules/@types` directories a config at `configFilePath` searches,
 * nearest first — the same walk up the directory tree the compiler does when no
 * `typeRoots` is configured.
 */
function getDefaultTypeRoots(configFilePath: string): string[] {
  const typeRoots: string[] = [];
  let dirPath = configFilePath.substring(0, configFilePath.lastIndexOf("/"));
  while (true) {
    typeRoots.push(`${dirPath}/node_modules/@types`);
    const index = dirPath.lastIndexOf("/");
    if (index < 0)
      break;
    dirPath = dirPath.substring(0, index);
  }
  return typeRoots;
}

/**
 * Narrows the deepest directory containing everything so far to also contain
 * `filePath`, returning `common` itself when it already did.
 *
 * Directories are carried as path segments rather than as a string so that adding a
 * file costs a comparison per segment rather than a walk over every file held — see
 * DocumentRegistry#addToCommonDirectory.
 */
function narrowCommonDirectory(common: string[] | undefined, filePath: string): string[] {
  const parts = filePath.split("/").slice(0, -1);
  if (common == null)
    return parts;
  let i = 0;
  while (i < common.length && i < parts.length && common[i] === parts[i])
    i++;
  return i === common.length ? common : common.slice(0, i);
}

/** The directory the segments name, or `undefined` when they name none. */
function commonDirectoryOf(common: string[] | undefined): string | undefined {
  if (common == null || common.length === 0)
    return undefined;
  return common.join("/") || "/";
}

/** Matches the file names the compiler treats as declaration files. */
const declarationFileNameRegex = /\.d\.[cm]?ts$/i;

const internalOptionNames = new Set(["configFilePath", "pathsBasePath"]);

const enumOptionNames: Record<string, Record<number, string>> = {
  jsx: {
    [JsxEmit.Preserve]: "preserve",
    [JsxEmit.ReactNative]: "react-native",
    [JsxEmit.React]: "react",
    [JsxEmit.ReactJSX]: "react-jsx",
    [JsxEmit.ReactJSXDev]: "react-jsxdev",
  },
  module: {
    [ModuleKind.CommonJS]: "commonjs",
    [ModuleKind.AMD]: "amd",
    [ModuleKind.System]: "system",
    [ModuleKind.UMD]: "umd",
    [ModuleKind.ES2015]: "es2015",
    [ModuleKind.ES2020]: "es2020",
    [ModuleKind.ES2022]: "es2022",
    [ModuleKind.ESNext]: "esnext",
    [ModuleKind.Node16]: "node16",
    [ModuleKind.Node18]: "node18",
    [ModuleKind.Node20]: "node20",
    [ModuleKind.NodeNext]: "nodenext",
    [ModuleKind.Preserve]: "preserve",
  },
  moduleDetection: { [ModuleDetectionKind.Auto]: "auto", [ModuleDetectionKind.Legacy]: "legacy", [ModuleDetectionKind.Force]: "force" },
  moduleResolution: {
    [ModuleResolutionKind.Classic]: "classic",
    [ModuleResolutionKind.Node10]: "node10",
    [ModuleResolutionKind.Node16]: "node16",
    [ModuleResolutionKind.NodeNext]: "nodenext",
    [ModuleResolutionKind.Bundler]: "bundler",
  },
  newLine: { [NewLineKind.CRLF]: "crlf", [NewLineKind.LF]: "lf" },
  target: {
    // tsgo removed ES5 as a target but its config parser still recognises the
    // name, so a project that asks for it has to reach the program to be told the
    // option is gone. Dropping it here instead would compile at the default target
    // and report nothing. `ScriptTarget` has no ES5 member to name the value with.
    1: "es5",
    [ScriptTarget.ES2015]: "es2015",
    [ScriptTarget.ES2016]: "es2016",
    [ScriptTarget.ES2017]: "es2017",
    [ScriptTarget.ES2018]: "es2018",
    [ScriptTarget.ES2019]: "es2019",
    [ScriptTarget.ES2020]: "es2020",
    [ScriptTarget.ES2021]: "es2021",
    [ScriptTarget.ES2022]: "es2022",
    [ScriptTarget.ES2023]: "es2023",
    [ScriptTarget.ES2024]: "es2024",
    [ScriptTarget.ES2025]: "es2025",
    [ScriptTarget.ESNext]: "esnext",
  },
};
