/**
 * Source file storage backed by tsgo.
 *
 * Replaces the `ts.DocumentRegistry` / `IScriptSnapshot` model, which has no
 * tsgo counterpart. ts-morph used to hand the compiler a text snapshot and get a
 * parsed file straight back; tsgo owns parsing and the file system, so text is
 * written into an in-memory file system, the session is told what changed, and
 * the parsed file is read back off the project's program.
 *
 * Breaking change: files are supplied as strings rather than `IScriptSnapshot`,
 * and compiler options are set for the registry as a whole rather than per call,
 * because tsgo resolves them per project.
 */
import type { CompilerOptions } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/compilerOptions.js";
import { createVirtualFileSystem, type FileSystem } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/fs.js";
import type { ModuleNameResolver } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/options.js";
import type { API, Project, Snapshot } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/api.js";
import { createWasmAPI } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/wasm/node.js";
import type { SourceFile } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/index.js";
import { JsxEmit } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/jsxEmit.enum.js";
import { ModuleDetectionKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleDetectionKind.enum.js";
import { ModuleKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleKind.enum.js";
import { ModuleResolutionKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/moduleResolutionKind.enum.js";
import { NewLineKind } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/newLineKind.enum.js";
import { ScriptTarget } from "../../../../submodules/typescript-go/_packages/native-preview/dist/enums/scriptTarget.enum.js";

/** The tsconfig every file in the registry belongs to. */
const configFilePath = "/tsconfig.json";

/** How many superseded snapshots the checker handed objects out from are kept alive — see DocumentRegistry#retire. */
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

export class DocumentRegistry {
  readonly #fs: FileSystem;
  readonly #api: API;
  readonly #versions = new Map<string, number>();
  readonly #retiredSnapshots: Snapshot[] = [];
  #compilerOptions: CompilerOptions;
  #snapshot: Snapshot | undefined;
  #project: Project | undefined;
  #checkerUsed = false;
  #disposed = false;

  constructor(options: DocumentRegistryOptions = {}) {
    this.#compilerOptions = options.compilerOptions ?? {};
    for (const fileName of Object.keys(options.files ?? {}))
      this.#versions.set(fileName, 0);
    this.#fs = createVirtualFileSystem({
      [configFilePath]: this.#configText(),
      ...options.files,
    });
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
    this.#assertNotDisposed();
    const existed = this.#versions.has(fileName);
    this.#fs.writeFile!(fileName, text);
    this.#versions.set(fileName, (this.#versions.get(fileName) ?? -1) + 1);
    this.#applyChange(existed ? { changed: [fileName] } : { created: [fileName] });
    return this.getSourceFileOrThrow(fileName);
  }

  /**
   * Replaces the compiler options the registry's project is opened with.
   *
   * The options live in the synthetic tsconfig, so changing them rewrites it and
   * reopens the project — every file is reparsed against the new options.
   */
  setCompilerOptions(compilerOptions: CompilerOptions): void {
    this.#assertNotDisposed();
    this.#compilerOptions = compilerOptions;
    this.#fs.writeFile!(configFilePath, this.#configText());
    this.#openProject({ fileChanges: { changed: [configFilePath] }, openProject: configFilePath });
  }

  /** Removes a file from the registry. */
  removeSourceFile(fileName: string): void {
    this.#assertNotDisposed();
    if (!this.#versions.delete(fileName))
      return;
    this.#fs.removeFile!(fileName);
    this.#applyChange({ deleted: [fileName] });
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
    this.#api.close();
  }

  /**
   * Reports a file change and reopens the project on the resulting snapshot.
   *
   * The change and the reopen are one call so an edit costs one snapshot rather
   * than two, and the snapshot it replaces is let go of — see #retire for when
   * that means disposing it. Letting go happens after the new snapshot exists so
   * the source file cache can first carry unchanged files' entries across; that
   * is what preserves node identity for every file the edit did not touch.
   */
  #applyChange(changes: { changed?: string[]; created?: string[]; deleted?: string[] }): void {
    // adding or removing a file changes the root file list, so the config has to
    // be rewritten with it — see #configText for why the list is explicit
    if (changes.created != null || changes.deleted != null) {
      this.#fs.writeFile!(configFilePath, this.#configText());
      changes = { ...changes, changed: [...changes.changed ?? [], configFilePath] };
    }
    this.#openProject({ fileChanges: changes, openProject: configFilePath });
  }

  /**
   * The registry's tsconfig, which names every file it holds.
   *
   * The list has to be explicit. Left to a wildcard, the config picks up files by
   * extension priority, which drops `a.d.ts` and `a.js` on the floor whenever
   * `a.ts` is also present — and ts-morph's contract is that a file the caller
   * added is in the project, whatever else shares its stem.
   */
  #configText(): string {
    const files = [...this.#versions.keys()];
    return JSON.stringify({ compilerOptions: { allowJs: true, ...toConfigCompilerOptions(this.#compilerOptions, files) }, files });
  }

  #getProject(): Project {
    this.#assertNotDisposed();
    if (this.#project == null)
      this.#openProject({ openProject: configFilePath });
    return this.#project!;
  }

  #openProject(params: { fileChanges?: { changed?: string[]; created?: string[]; deleted?: string[] }; openProject: string }): void {
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
function toConfigCompilerOptions(compilerOptions: CompilerOptions, files: readonly string[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  let configFilePath: string | undefined;
  for (const [name, value] of Object.entries(compilerOptions)) {
    if (name === "configFilePath" && typeof value === "string")
      configFilePath = value;
    if (value === undefined || internalOptionNames.has(name))
      continue;
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
  if (result.rootDir == null) {
    const rootDir = getCommonDirectory(files.filter(f => !/\.d\.[cm]?ts$/i.test(f)));
    if (rootDir != null)
      result.rootDir = rootDir;
  }
  return result;
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

/** The deepest directory containing every path, or `undefined` when there is none. */
function getCommonDirectory(filePaths: readonly string[]): string | undefined {
  let common: string[] | undefined;
  for (const filePath of filePaths) {
    const parts = filePath.split("/").slice(0, -1);
    if (common == null) {
      common = parts;
      continue;
    }
    let i = 0;
    while (i < common.length && i < parts.length && common[i] === parts[i])
      i++;
    common = common.slice(0, i);
  }
  if (common == null || common.length === 0)
    return undefined;
  return common.join("/") || "/";
}

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
