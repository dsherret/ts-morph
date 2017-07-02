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
    getCompilerOptions() {
        let compilerOptions: ts.CompilerOptions;

        if (this.options.compilerOptions != null)
            compilerOptions = {...this.options.compilerOptions};
        else if (this.options.tsConfigFilePath != null)
            compilerOptions = this.getCompilerOptionsFromTsConfig(this.options.tsConfigFilePath);
        else
            compilerOptions = {};

        return compilerOptions;
    }

    /*
    // very rough and not thought out inefficient method (should cache the compiler options)... will use this when implementing #7
    getFilePathsFromTsConfig() {
        const absoluteFilePath = FileUtils.getAbsoluteOrRelativePathFromPath(this.options.tsConfigFilePath!, FileUtils.getCurrentDirectory());
        this.verifyFileExists(absoluteFilePath);
        const text = this.fileSystem.readFile(absoluteFilePath);
        const json = ts.parseConfigFileTextToJson(absoluteFilePath, text, true);
        const host: ts.ParseConfigHost = {
            useCaseSensitiveFileNames: true,
            readDirectory: (rootDir, extensions, excludes, includes) => ts.sys.readDirectory(rootDir, extensions, excludes, includes),
            fileExists: path => this.fileSystem.fileExists(path),
            readFile: path => this.fileSystem.readFile(path)
        };
        const result = ts.parseJsonConfigFileContent(json, host, FileUtils.getCurrentDirectory());
        return result.fileNames;
    }
    */

    private getCompilerOptionsFromTsConfig(filePath: string) {
        const absoluteFilePath = FileUtils.getAbsoluteOrRelativePathFromPath(filePath, FileUtils.getCurrentDirectory());
        this.verifyFileExists(absoluteFilePath);
        const text = this.fileSystem.readFile(absoluteFilePath);
        const result = ts.parseConfigFileTextToJson(absoluteFilePath, text, true);

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
