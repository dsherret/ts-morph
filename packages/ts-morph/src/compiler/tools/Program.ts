import { errors, getEmitModuleResolutionKind, ModuleResolutionKind, nameof, ts } from "@ts-morph/common";
import { ProjectContext } from "../../ProjectContext";
import { SourceFile } from "../ast/module";
import { Diagnostic, EmitResult, MemoryEmitResult, MemoryEmitResultFile } from "./results";
import { TypeChecker } from "./TypeChecker";

/**
 * Options for emitting from a Program.
 */
export interface ProgramEmitOptions extends EmitOptions {
  /**
   * Called for each output file instead of writing it to the file system.
   *
   * Breaking change: `sourceFiles` holds at most the one source file the output
   * came from. tsgo reports a single originating file per output, so a bundled
   * output cannot list every file that fed it.
   */
  writeFile?: ts.WriteFileCallback;
}

/**
 * Options for emitting.
 */
export interface EmitOptions extends EmitOptionsBase {
  /**
   * Optional source file to only emit.
   */
  targetSourceFile?: SourceFile;
}

/**
 * Breaking change: `customTransformers` is gone. tsgo's emitter runs in the
 * compiler and does not accept JavaScript transforms.
 */
export interface EmitOptionsBase {
  /**
   * Whether only .d.ts files should be emitted.
   */
  emitOnlyDtsFiles?: boolean;
}

/** @internal */
export interface ProgramCreationData {
  context: ProjectContext;
  configFileParsingDiagnostics: ts.Diagnostic[];
}

/**
 * Wrapper around Program.
 */
export class Program {
  /** @internal */
  readonly #context: ProjectContext;
  /** @internal */
  readonly #typeChecker: TypeChecker;
  /** @internal */
  readonly #configFileParsingDiagnostics: ts.Diagnostic[];

  /** @private */
  constructor(opts: ProgramCreationData) {
    this.#context = opts.context;
    this.#configFileParsingDiagnostics = opts.configFileParsingDiagnostics;
    this.#typeChecker = new TypeChecker(this.#context);
    this._reset();
  }

  /**
   * Gets the underlying compiler program.
   */
  get compilerObject(): ts.Program {
    return this.#context.compilerFactory.documentRegistry.program;
  }

  /**
   * Gets if the internal compiler program is created.
   * @internal
   */
  _isCompilerProgramCreated() {
    return true;
  }

  /**
   * Resets the program.
   *
   * The tsgo session reopens the project on every file change, so the program
   * and the checker are always the current snapshot's; there is nothing to
   * recreate here beyond pointing the checker back at them.
   * @internal
   */
  _reset() {
    this.#typeChecker._reset(() => this.#context.compilerFactory.documentRegistry.checker);
  }

  /**
   * Get the program's type checker.
   */
  getTypeChecker() {
    return this.#typeChecker;
  }

  /**
   * Asynchronously emits the TypeScript files as JavaScript files.
   * @param options - Options for emitting.
   */
  async emit(options: ProgramEmitOptions = {}) {
    if (options.writeFile) {
      const message = `Cannot specify a ${nameof<ProgramEmitOptions>("writeFile")} option when emitting asynchrously. `
        + `Use ${nameof<Program>("emitSync")}() instead.`;
      throw new errors.InvalidOperationError(message);
    }

    const { fileSystemWrapper } = this.#context;
    const output = this.#getEmitOutput(options);
    await Promise.all(
      [...output.outputFiles].map(([filePath, file]) =>
        fileSystemWrapper.writeFile(fileSystemWrapper.getStandardizedAbsolutePath(filePath), textToWrite(file))
      ),
    );
    return new EmitResult(this.#context, toEmitResult(output));
  }

  /**
   * Synchronously emits the TypeScript files as JavaScript files.
   * @param options - Options for emitting.
   * @remarks Use `emit()` as the asynchronous version will be much faster.
   */
  emitSync(options: ProgramEmitOptions = {}) {
    const { fileSystemWrapper } = this.#context;
    const output = this.#getEmitOutput(options);
    for (const [filePath, file] of output.outputFiles) {
      const standardizedFilePath = fileSystemWrapper.getStandardizedAbsolutePath(filePath);
      if (options.writeFile)
        options.writeFile(standardizedFilePath, file.text, file.writeByteOrderMark ?? false, undefined, this.#getEmitSourceFiles(file));
      else
        fileSystemWrapper.writeFileSync(standardizedFilePath, textToWrite(file));
    }
    return new EmitResult(this.#context, toEmitResult(output));
  }

  /**
   * The source files an output file came from, for a write callback.
   *
   * tsgo names a single originating file per output, so this is empty or a
   * one-element list; a file the program does not know is skipped.
   * @internal
   */
  #getEmitSourceFiles(file: ts.OutputFile): ts.SourceFile[] {
    if (file.sourceFileName == null)
      return [];
    const sourceFile = this.compilerObject.getSourceFile(file.sourceFileName);
    return sourceFile == null ? [] : [sourceFile];
  }

  /**
   * Emits the TypeScript files to JavaScript files to memory.
   * @param options - Options for emitting.
   */
  emitToMemory(options: EmitOptions = {}) {
    const output = this.#getEmitOutput(options);
    const { fileSystemWrapper } = this.#context;
    const sourceFiles: MemoryEmitResultFile[] = [];
    // tsgo keys the output by path rather than storing it on the file.
    for (const [filePath, file] of output.outputFiles) {
      sourceFiles.push({
        filePath: fileSystemWrapper.getStandardizedAbsolutePath(filePath),
        text: file.text,
        writeByteOrderMark: file.writeByteOrderMark ?? false,
      });
    }
    return new MemoryEmitResult(this.#context, toEmitResult(output), sourceFiles);
  }

  /**
   * The output for a single file.
   *
   * A project emit cannot be restricted to one file in tsgo, so a targeted emit
   * asks the program for that file's output and writes it out here instead. tsgo
   * splits emit into a JavaScript half and a declaration half, so both are asked
   * for and merged whenever declarations are on.
   * @internal
   */
  _getEmitOutputForFilePath(filePath: string, emitOnlyDtsFiles?: boolean): ts.EmitOutput {
    const program = this.compilerObject;
    if (emitOnlyDtsFiles)
      return withOrderedOutputFiles(program.getDeclarationEmit([filePath]));
    const javaScript = program.getJavaScriptEmit([filePath]);
    const compilerOptions = program.getCompilerOptions();
    if (!compilerOptions.declaration && !compilerOptions.composite)
      return withOrderedOutputFiles(javaScript);

    const declarations = program.getDeclarationEmit([filePath]);
    return withOrderedOutputFiles({
      emitSkipped: javaScript.emitSkipped && declarations.emitSkipped,
      diagnostics: [...javaScript.diagnostics, ...declarations.diagnostics],
      outputFiles: new Map([...javaScript.outputFiles, ...declarations.outputFiles]),
    });
  }

  /**
   * The output of the emit the options describe, without writing anything.
   *
   * The whole-project emit goes through `emitToString` rather than the compiler's
   * own `emit` so that ts-morph writes the files itself: tsgo emits through the
   * session's file system, which knows nothing of ts-morph's queued operations,
   * write log or `isSaved` bookkeeping.
   */
  #getEmitOutput(options: EmitOptions): ts.EmitOutput {
    if (options.targetSourceFile != null)
      return this._getEmitOutputForFilePath(options.targetSourceFile.getFilePath(), options.emitOnlyDtsFiles);
    return withOrderedOutputFiles(this.compilerObject.emitToString(getEmitOnly(options)));
  }

  /**
   * Gets the syntactic diagnostics.
   *
   * Breaking change: these are `Diagnostic`s. tsgo has no separate
   * `DiagnosticWithLocation` type — see {@link Diagnostic#getSourceFile}.
   * @param sourceFile - Optional source file to filter by.
   */
  getSyntacticDiagnostics(sourceFile?: SourceFile): Diagnostic[] {
    const compilerDiagnostics = this.compilerObject.getSyntacticDiagnostics(sourceFile?.getFilePath());
    return compilerDiagnostics.map(d => this.#context.compilerFactory.getDiagnostic(d));
  }

  /**
   * Gets the semantic diagnostics.
   * @param sourceFile - Optional source file to filter by.
   */
  getSemanticDiagnostics(sourceFile?: SourceFile): Diagnostic[] {
    const compilerDiagnostics = this.compilerObject.getSemanticDiagnostics(sourceFile?.getFilePath());
    return compilerDiagnostics.map(d => this.#context.compilerFactory.getDiagnostic(d));
  }

  /**
   * Gets the declaration diagnostics.
   * @param sourceFile - Optional source file to filter by.
   */
  getDeclarationDiagnostics(sourceFile?: SourceFile): Diagnostic[] {
    const compilerDiagnostics = this.compilerObject.getDeclarationDiagnostics(sourceFile?.getFilePath());
    return compilerDiagnostics.map(d => this.#context.compilerFactory.getDiagnostic(d));
  }

  /**
   * Gets the global diagnostics.
   */
  getGlobalDiagnostics(): Diagnostic[] {
    const compilerDiagnostics = this.compilerObject.getGlobalDiagnostics();
    return compilerDiagnostics.map(d => this.#context.compilerFactory.getDiagnostic(d));
  }

  /**
   * Gets the diagnostics found when parsing the tsconfig.json file.
   *
   * These are the ones the project's own tsconfig produced. Asking the compiler
   * object would instead report on the synthetic config the document registry
   * opens its project from, which the user never wrote.
   */
  getConfigFileParsingDiagnostics(): Diagnostic[] {
    return this.#configFileParsingDiagnostics.map(d => this.#context.compilerFactory.getDiagnostic(d));
  }

  /**
   * Gets the emit module resolution kind.
   */
  getEmitModuleResolutionKind(): ModuleResolutionKind {
    return getEmitModuleResolutionKind(this.compilerObject.getCompilerOptions());
  }

  /**
   * Gets if the provided source file was discovered while loading an external library.
   * @param sourceFile - Source file.
   */
  isSourceFileFromExternalLibrary(sourceFile: SourceFile) {
    // Do not use compilerObject.isSourceFileFromExternalLibrary because that method
    // will become out of date after a manipulation has happened to a source file.
    // Read more in sourceFile.isFromExternalLibrary()'s method body.
    return sourceFile.isFromExternalLibrary();
  }
}

/** tsgo restricts an emit by output kind rather than by a boolean. */
function getEmitOnly(options: EmitOptionsBase): ts.EmitOnly | undefined {
  return options.emitOnlyDtsFiles ? ts.EmitOnly.OnlyDts : undefined;
}

/**
 * Outputs of one source file, in the order they are emitted.
 *
 * A source map is written before the file it describes, and the declarations
 * after the JavaScript — the order the emitter produced them in, which
 * `getOutputFilePaths()` reports and an emit writes the files in. tsgo returns
 * its output keyed by path instead, so the order has to be restored here.
 */
const outputFileRanks: ReadonlyArray<{ suffixes: ReadonlyArray<string> }> = [
  { suffixes: [".js.map", ".jsx.map", ".mjs.map", ".cjs.map"] },
  { suffixes: [".js", ".jsx", ".mjs", ".cjs"] },
  { suffixes: [".d.ts.map", ".d.mts.map", ".d.cts.map"] },
  { suffixes: [".d.ts", ".d.mts", ".d.cts"] },
];

function withOrderedOutputFiles(output: ts.EmitOutput): ts.EmitOutput {
  return { ...output, outputFiles: orderOutputFiles(output.outputFiles) };
}

function orderOutputFiles(outputFiles: ReadonlyMap<string, ts.OutputFile>): Map<string, ts.OutputFile> {
  const groups = new Map<string, [string, ts.OutputFile][]>();
  for (const entry of outputFiles) {
    const group = groups.get(getOutputFileBasePath(entry[0]));
    if (group == null)
      groups.set(getOutputFileBasePath(entry[0]), [entry]);
    else
      group.push(entry);
  }

  const result = new Map<string, ts.OutputFile>();
  for (const group of groups.values()) {
    for (const [filePath, file] of group.sort((a, b) => getOutputFileRank(a[0]) - getOutputFileRank(b[0])))
      result.set(filePath, file);
  }
  return result;
}

/** The path shared by every output of one source file. */
function getOutputFileBasePath(filePath: string) {
  for (const { suffixes } of outputFileRanks) {
    const suffix = suffixes.find(s => filePath.endsWith(s));
    if (suffix != null)
      return filePath.substring(0, filePath.length - suffix.length);
  }
  return filePath;
}

function getOutputFileRank(filePath: string) {
  const rank = outputFileRanks.findIndex(({ suffixes }) => suffixes.some(s => filePath.endsWith(s)));
  return rank === -1 ? outputFileRanks.length : rank;
}

function toEmitResult(output: ts.EmitOutput): ts.EmitResult {
  return {
    emitSkipped: output.emitSkipped,
    diagnostics: output.diagnostics,
    emittedFiles: [...output.outputFiles.keys()],
  };
}

/**
 * The bytes an output file is written as.
 *
 * The emit output reports its text and its byte order mark separately, so the
 * mark goes back on the front when the file is actually written.
 */
function textToWrite(file: ts.OutputFile) {
  return file.writeByteOrderMark ? "﻿" + file.text : file.text;
}
