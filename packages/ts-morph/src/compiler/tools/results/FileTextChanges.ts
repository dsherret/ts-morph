import { errors, Memoize, ts } from "@ts-morph/common";
import { SourceFile } from "../../../compiler";
import { ProjectContext } from "../../../ProjectContext";
import { TextChange } from "./TextChange";

export interface ApplyFileTextChangesOptions {
  /**
   * If a file should be overwritten when the file text change is for a new file, but the file currently exists.
   */
  overwrite?: boolean;
}

export class FileTextChanges {
  /** @internal */
  readonly #context: ProjectContext;
  /** @internal */
  readonly #compilerObject: ts.FileTextChanges;
  /** @internal */
  readonly #sourceFile: SourceFile | undefined;
  /** @internal */
  readonly #existingFileExists: boolean;
  /** @internal */
  #isApplied: true | undefined;

  /** @private */
  constructor(context: ProjectContext, compilerObject: ts.FileTextChanges) {
    this.#context = context;
    this.#compilerObject = compilerObject;

    const file = context.compilerFactory
      .addOrGetSourceFileFromFilePath(context.fileSystemWrapper.getStandardizedAbsolutePath(compilerObject.fileName), {
        markInProject: false,
        scriptKind: undefined,
      });
    this.#existingFileExists = file != null;
    if (!compilerObject.isNewFile)
      this.#sourceFile = file;
  }

  /**
   * Gets the file path.
   */
  getFilePath() {
    return this.#compilerObject.fileName;
  }

  /**
   * Gets the source file if it was in the cache at the time of this class' creation.
   */
  getSourceFile() {
    return this.#sourceFile;
  }

  /**
   * Gets the text changes
   */
  @Memoize
  getTextChanges() {
    return this.#compilerObject.textChanges.map(c => new TextChange(c));
  }

  /**
   * Applies the text changes to the file. This modifies and possibly creates a new source file.
   *
   * WARNING: This will forget any previously navigated descendant nodes in the source file.
   * @param options - Options for applying the text changes to the file.
   */
  applyChanges(options: ApplyFileTextChangesOptions = {}) {
    if (this.#isApplied)
      return;

    if (this.isNewFile() && this.#existingFileExists && !options.overwrite) {
      throw new errors.InvalidOperationError(
        `Cannot apply file text change for creating a new file when the `
          + `file exists at path ${this.getFilePath()}. Did you mean to provide the overwrite option?`,
      );
    }

    let file: SourceFile | undefined;
    if (this.isNewFile())
      file = this.#context.project.createSourceFile(this.getFilePath(), "", { overwrite: options.overwrite });
    else
      file = this.getSourceFile();

    if (file == null) {
      throw new errors.InvalidOperationError(
        `Cannot apply file text change to modify existing file `
          + `that doesn't exist at path: ${this.getFilePath()}`,
      );
    }

    file.applyTextChanges(this.getTextChanges());
    file._markAsInProject();
    this.#isApplied = true;

    return this;
  }

  /**
   * Gets if this change is for creating a new file.
   */
  isNewFile() {
    return !!this.#compilerObject.isNewFile;
  }
}
