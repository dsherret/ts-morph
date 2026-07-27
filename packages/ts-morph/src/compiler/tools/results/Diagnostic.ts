import { DiagnosticCategory, Memoize, StringUtils, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { SourceFile } from "../../ast";
import { DiagnosticMessageChain } from "./DiagnosticMessageChain";

/**
 * Diagnostic.
 */
export class Diagnostic<TCompilerObject extends ts.Diagnostic = ts.Diagnostic> {
  /** @internal */
  readonly _context: ProjectContext | undefined;
  /** @internal */
  readonly _compilerObject: TCompilerObject;

  /** @private */
  constructor(context: ProjectContext | undefined, compilerObject: TCompilerObject) {
    this._context = context;
    this._compilerObject = compilerObject;

    // memoize
    this.getSourceFile();
  }

  /**
   * Gets the underlying compiler diagnostic.
   */
  get compilerObject(): TCompilerObject {
    return this._compilerObject;
  }

  /**
   * Gets the source file.
   *
   * Breaking change: tsgo reports the file by name rather than handing back the
   * parsed file, so this resolves the name against the files the project has
   * wrapped. A diagnostic reported on a file the program pulled in but the
   * project never added (a lib file, an implicit dependency) has no wrapper to
   * return, and yields undefined where the `typescript` package returned one.
   */
  @Memoize
  getSourceFile(): SourceFile | undefined {
    if (this._context == null)
      return undefined;
    const fileName = this.compilerObject.fileName;
    return fileName == null ? undefined : this._context.compilerFactory.getSourceFileFromCacheFromFilePath(
      this._context.fileSystemWrapper.getStandardizedAbsolutePath(fileName),
    );
  }

  /**
   * Gets the message text.
   *
   * Breaking change: this is always a string. tsgo puts the message on `text`
   * and nests any chained messages under `messageChain`, so a chain no longer
   * arrives in place of the text � see {@link getMessageChain}.
   */
  getMessageText(): string {
    return this._compilerObject.text;
  }

  /**
   * Gets the chained messages that elaborate on this diagnostic, if any.
   */
  getMessageChain(): DiagnosticMessageChain[] | undefined {
    const messageChain = this._compilerObject.messageChain;
    if (messageChain == null)
      return undefined;
    if (this._context == null)
      return messageChain.map(m => new DiagnosticMessageChain(m));
    return messageChain.map(m => this._context!.compilerFactory.getDiagnosticMessageChain(m));
  }

  /**
   * Gets the line number.
   */
  getLineNumber() {
    const sourceFile = this.getSourceFile();
    const start = this.getStart();
    if (sourceFile == null || start == null)
      return undefined;
    return StringUtils.getLineNumberAtPos(sourceFile.getFullText(), start);
  }

  /**
   * Gets the start.
   *
   * tsgo reports a span rather than a start and a length, and gives `-1` for a
   * diagnostic with no location (an option error, say) where the `typescript`
   * package left both undefined. That is reported as `undefined` here, so
   * `getStart()` stays a position into the file or nothing at all.
   */
  getStart(): number | undefined {
    return this.#hasLocation() ? this.compilerObject.pos : undefined;
  }

  /**
   * Gets the length.
   */
  getLength(): number | undefined {
    return this.#hasLocation() ? this.compilerObject.end - this.compilerObject.pos : undefined;
  }

  /** @internal */
  #hasLocation() {
    return this.compilerObject.pos >= 0;
  }

  /**
   * Gets the diagnostic category.
   */
  getCategory(): DiagnosticCategory {
    return this.compilerObject.category;
  }

  /**
   * Gets the code of the diagnostic.
   */
  getCode() {
    return this.compilerObject.code;
  }
}
