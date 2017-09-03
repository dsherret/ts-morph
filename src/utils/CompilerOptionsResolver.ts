import * as ts from "typescript";
import {FileNotFoundError} from "./../errors";
import {FileSystemHost} from "./../FileSystemHost";
import {FileUtils} from "./FileUtils";

/**
 * Resolves compiler options.
 */
export class CompilerOptionsResolver {
    /**
     * Initializes a new instance.
     * @param fileSystem - Host for reading files.
     */
    constructor(private readonly fileSystem: FileSystemHost, private readonly options: { compilerOptions?: ts.CompilerOptions; tsConfigFilePath?: string; }) {
    }

    /**
     * Get the compiler options.
     * @param options - The passed in compiler options or the tsconfig.json file path.
     */
    getCompilerOptions(): ts.CompilerOptions {
        return {
            ...(this.options.tsConfigFilePath == null ? {} : this.getCompilerOptionsFromTsConfig(this.options.tsConfigFilePath)),
            ...(this.options.compilerOptions || {}) as ts.CompilerOptions
        };
    }

    private getCompilerOptionsFromTsConfig(filePath: string) {
        const absoluteFilePath = FileUtils.getAbsoluteOrRelativePathFromPath(filePath, FileUtils.getCurrentDirectory());
        this.verifyFileExists(absoluteFilePath);
        const text = this.fileSystem.readFile(absoluteFilePath);
        const result = ts.parseConfigFileTextToJson(absoluteFilePath, text);

        if (result.error != null)
            throw new Error(result.error.messageText.toString());

        const settings = ts.convertCompilerOptionsFromJson(result.config.compilerOptions, FileUtils.getDirName(filePath));

        if (!settings.options)
            throw new Error(this.getErrorMessage(settings.errors));

        return settings.options;
    }

    private getErrorMessage(errors: ts.Diagnostic[]) {
        let message = "";
        errors.forEach(err => message += `${err.messageText}\n`);
        return message;
    }

    private verifyFileExists(filePath: string) {
        // unfortunately the ts compiler doesn't do things asynchronously so for now we won't either
        if (!this.fileSystem.fileExists(filePath))
            throw new FileNotFoundError(filePath);
    }
}
