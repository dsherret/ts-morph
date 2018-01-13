import * as ts from "typescript";
import {Diagnostic} from "./../../compiler";
import {DefaultFileSystemHost, FileSystemHost} from "./../../fileSystem";
import {FileUtils} from "./../../utils";
import {getTsConfigParseResult, getCompilerOptionsFromTsConfigParseResult} from "./getInfoFromTsConfig";

/**
 * Gets the compiler options from a specified tsconfig.json
 * @param filePath - File path to the tsconfig.json.
 * @param fileSystemHost - Optional file system host.
 */
export function getCompilerOptionsFromTsConfig(filePath: string, fileSystemHost?: FileSystemHost): { options: ts.CompilerOptions; errors: Diagnostic[]; } {
    // remember, this is a public function
    fileSystemHost = fileSystemHost || new DefaultFileSystemHost();
    const parseResult = getTsConfigParseResult(filePath, fileSystemHost);
    return getCompilerOptionsFromTsConfigParseResult(filePath, fileSystemHost, parseResult);
}
