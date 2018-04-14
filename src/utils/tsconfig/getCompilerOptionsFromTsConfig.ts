import { ts, CompilerOptions } from "../../typescript";
import { Diagnostic } from "../../compiler";
import { DefaultFileSystemHost, FileSystemHost, FileSystemWrapper } from "../../fileSystem";
import { FileUtils } from "../../utils";
import { getTsConfigParseResult, getCompilerOptionsFromTsConfigParseResult } from "./getInfoFromTsConfig";

export interface CompilerOptionsFromTsConfigOptions {
    encoding?: string;
    fileSystem?: FileSystemHost;
}

export interface CompilerOptionsFromTsConfigResult {
    options: CompilerOptions;
    errors: Diagnostic[];
}

/**
 * Gets the compiler options from a specified tsconfig.json
 * @param filePath - File path to the tsconfig.json.
 * @param options - Options.
 */
export function getCompilerOptionsFromTsConfig(filePath: string, options: CompilerOptionsFromTsConfigOptions = {}): CompilerOptionsFromTsConfigResult {
    // remember, this is a public function
    const fileSystemWrapper = new FileSystemWrapper(options.fileSystem || new DefaultFileSystemHost());
    const tsConfigParseResult = getTsConfigParseResult({ tsConfigFilePath: filePath, encoding: options.encoding || "utf-8", fileSystemWrapper });
    return getCompilerOptionsFromTsConfigParseResult({ tsConfigFilePath: filePath, fileSystemWrapper, tsConfigParseResult });
}
