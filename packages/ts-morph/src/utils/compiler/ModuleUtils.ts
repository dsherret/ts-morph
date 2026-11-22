import { CompilerOptions, StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { SourceFile, Symbol } from "../../compiler";

export class ModuleUtils {
  private constructor() {
  }

  static isModuleSpecifierRelative(text: string) {
    return text.startsWith("./")
      || text.startsWith("../");
  }

  /**
   * Removes the file extension, treating declaration file extensions (ex. `.d.mts`) as a single extension.
   * An arbitrary extension declaration file (ex. `styles.d.css.ts`) becomes the file it describes (ex. `styles.css`).
   */
  static removeFileExtension(path: string) {
    return path.replace(
      /\.d\.([^/.]+)\.ts$|\.d\.[cm]?ts$|\.[^/.]+$/i,
      (_match, arbitraryExtension: string | undefined) => arbitraryExtension == null ? "" : "." + arbitraryExtension,
    );
  }

  /** Gets the extension a module specifier should use to import the file or undefined when it's not a known module extension. */
  static getModuleSpecifierExtension(filePath: string, compilerOptions: CompilerOptions) {
    // the specifier for an arbitrary extension declaration file already ends with the extension it describes
    if (/\.d\.[^/.]+\.ts$/i.test(filePath))
      return undefined;
    const extension = /\.d\.[cm]?ts$|\.[^/.]+$/i.exec(filePath)?.[0].toLowerCase();
    switch (extension) {
      case ".ts":
      case ".d.ts":
      case ".js":
        return ".js";
      case ".tsx":
        return compilerOptions.jsx === ts.JsxEmit.Preserve ? ".jsx" : ".js";
      case ".jsx":
        return ".jsx";
      case ".mts":
      case ".d.mts":
      case ".mjs":
        return ".mjs";
      case ".cts":
      case ".d.cts":
      case ".cjs":
        return ".cjs";
      case ".json":
        return ".json";
      default:
        return undefined;
    }
  }

  static getReferencedSourceFileFromSymbol(symbol: Symbol) {
    const declarations = symbol.getDeclarations();
    if (declarations.length === 0 || declarations[0].getKind() !== SyntaxKind.SourceFile)
      return undefined;
    return declarations[0] as SourceFile;
  }
}
