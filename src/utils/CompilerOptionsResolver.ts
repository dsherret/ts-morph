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
    constructor(private readonly fileSystem: FileSystemHost) {
    }

    /**
     * Get the compiler options.
     * @param options - The passed in compiler options or the tsconfig.json file path.
     */
    getCompilerOptions(options: { compilerOptions?: ts.CompilerOptions; tsConfigFilePath?: string; }) {
        let compilerOptions: ts.CompilerOptions;

        if (options.compilerOptions != null)
            compilerOptions = {...options.compilerOptions};
        else if (options.tsConfigFilePath != null)
            compilerOptions = this.getCompilerOptionsFromTsConfig(options.tsConfigFilePath);
        else {
            const foundTsConfigFilePath = ts.findConfigFile(this.fileSystem.getCurrentDirectory(), fileName => this.fileSystem.fileExists(fileName));
            if (foundTsConfigFilePath != null && foundTsConfigFilePath.length > 0)
                compilerOptions = this.getCompilerOptionsFromTsConfig(foundTsConfigFilePath);
            else
                compilerOptions = this.getTsCompilerOptionDefaults();
        }

        return compilerOptions;
    }

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

    private getTsCompilerOptionDefaults() {
        return {
            allowJs: true,
            experimentalDecorators: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            noImplicitAny: false,
            noLib: false,
            strictNullChecks: false,
            suppressExcessPropertyErrors: true,
            suppressImplicitAnyIndexErrors: true,
            target: ts.ScriptTarget.Latest,
            types: []
        };
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
