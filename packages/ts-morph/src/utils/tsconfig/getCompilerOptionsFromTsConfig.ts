import { FileSystemHost, CompilerOptions, getCompilerOptionsFromTsConfig as coreGetCompilerOptionsFromTsConfig } from "@ts-morph/common";
import { Diagnostic } from "../../compiler";

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
    const result = coreGetCompilerOptionsFromTsConfig(filePath, options);
    return {
        options: result.options,
        errors: result.errors.map(error => new Diagnostic(undefined, error))
    };
}
