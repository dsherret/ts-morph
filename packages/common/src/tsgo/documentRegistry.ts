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
import type { API, Project } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/sync/api.js";
import type { SourceFile } from "../../../../submodules/typescript-go/_packages/native-preview/dist/ast/index.js";
import { createWasmAPI } from "../../../../submodules/typescript-go/_packages/native-preview/dist/api/wasm/node.js";

/** The tsconfig every file in the registry belongs to. */
const configFilePath = "/tsconfig.json";

export interface DocumentRegistryOptions {
  /** Compiler options for the registry's project. */
  compilerOptions?: CompilerOptions;
  /** Files to seed the registry with, as path → contents. */
  files?: Record<string, string>;
}

export class TsgoDocumentRegistry {
  readonly #fs: FileSystem;
  readonly #api: API;
  readonly #versions = new Map<string, number>();
  #project: Project | undefined;

  constructor(options: DocumentRegistryOptions = {}) {
    const files: Record<string, string> = {
      [configFilePath]: JSON.stringify({ compilerOptions: options.compilerOptions ?? {} }),
      ...options.files,
    };
    this.#fs = createVirtualFileSystem(files);
    this.#api = createWasmAPI({ cwd: "/", fs: this.#fs });
    for (const fileName of Object.keys(options.files ?? {}))
      this.#versions.set(fileName, 0);
  }

  /**
   * Adds a file or replaces its contents, and returns the parsed file. The
   * returned node tree is only valid until the next change to the same file.
   */
  createOrUpdateSourceFile(fileName: string, text: string): SourceFile {
    const existed = this.#versions.has(fileName);
    this.#fs.writeFile!(fileName, text);
    this.#versions.set(fileName, (this.#versions.get(fileName) ?? -1) + 1);
    this.#applyChange(existed ? { changed: [fileName] } : { created: [fileName] });
    return this.getSourceFileOrThrow(fileName);
  }

  /** Removes a file from the registry. */
  removeSourceFile(fileName: string): void {
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

  /** The number of times a file's contents have been replaced. */
  getSourceFileVersion(fileName: string): string {
    return String(this.#versions.get(fileName) ?? 0);
  }

  /** The project's checker, for type and symbol queries. */
  get checker() {
    return this.#getProject().checker;
  }

  /** The project's program, for diagnostics and file enumeration. */
  get program() {
    return this.#getProject().program;
  }

  dispose(): void {
    this.#api.close();
  }

  /**
   * Reports a file change and drops the cached trees. The cache is keyed by
   * snapshot, so stale entries would otherwise survive an edit.
   */
  #applyChange(changes: { changed?: string[]; created?: string[]; deleted?: string[] }): void {
    this.#api.updateSnapshot({ fileChanges: changes });
    this.#api.clearSourceFileCache();
    this.#project = undefined;
  }

  #getProject(): Project {
    if (this.#project == null) {
      const snapshot = this.#api.updateSnapshot({ openProject: configFilePath });
      const project = snapshot.getProject(configFilePath);
      if (project == null)
        throw new Error(`Could not open the project at ${configFilePath}`);
      this.#project = project;
    }
    return this.#project;
  }
}
