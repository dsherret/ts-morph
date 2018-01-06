import * as ts from "typescript";
import {Diagnostic} from "./../../compiler";
import {DefaultFileSystemHost, FileSystemHost} from "./../../fileSystem";
import {getInfoFromTsConfig} from "./getInfoFromTsConfig";

/**
 * Gets the compiler options from a specified tsconfig.json
 * @param filePath - File path to the tsconfig.json.
 * @param fileSystemHost - Optional file system host.
 */
export function getCompilerOptionsFromTsConfig(filePath: string, fileSystemHost?: FileSystemHost): { options: ts.CompilerOptions; errors: Diagnostic[]; } {
    // remember, this is a public function
    fileSystemHost = fileSystemHost || new DefaultFileSystemHost();
    const result = getInfoFromTsConfig(filePath, fileSystemHost, { shouldGetFilePaths: false });
    return { options: result.compilerOptions, errors: result.errors };
}
