import { FileSystemHost, RealFileSystemHost, TransactionalFileSystem } from "../fileSystem";
import { CompilerOptions, ts } from "../typescript";
import { TsConfigResolver } from "./TsConfigResolver";

export interface CompilerOptionsFromTsConfigOptions {
  encoding?: string;
  fileSystem?: FileSystemHost;
}

export interface CompilerOptionsFromTsConfigResult {
  options: CompilerOptions;
  errors: ts.Diagnostic[];
}

/**
 * Gets the compiler options from a specified tsconfig.json
 * @param filePath - File path to the tsconfig.json.
 * @param options - Options.
 */
export function getCompilerOptionsFromTsConfig(filePath: string, options: CompilerOptionsFromTsConfigOptions = {}): CompilerOptionsFromTsConfigResult {
  // remember, this is a public function
  const fileSystemWrapper = new TransactionalFileSystem({
    fileSystem: options.fileSystem || new RealFileSystemHost(),
    skipLoadingLibFiles: false,
    libFolderPath: undefined,
  });
  const tsConfigResolver = new TsConfigResolver(fileSystemWrapper, fileSystemWrapper.getStandardizedAbsolutePath(filePath), options.encoding || "utf-8");
  return {
    options: tsConfigResolver.getCompilerOptions(),
    errors: tsConfigResolver.getErrors(),
  };
}
