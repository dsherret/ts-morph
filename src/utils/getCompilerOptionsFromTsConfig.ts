import * as ts from "typescript";
import {FileNotFoundError} from "./../errors";
import {DefaultFileSystemHost, FileSystemHost} from "./../fileSystem";
import {FileUtils} from "./FileUtils";

/**
 * Gets the compiler options from a specified tsconfig.json
 * @param filePath - File path to the tsconfig.json.
 * @param fileSystemHost - Optional file system host.
 */
export function getCompilerOptionsFromTsConfig(filePath: string, fileSystemHost?: FileSystemHost) {
    fileSystemHost = fileSystemHost || new DefaultFileSystemHost();

    const absoluteFilePath = FileUtils.getStandardizedAbsolutePath(filePath, FileUtils.getCurrentDirectory());
    verifyFileExists(fileSystemHost, absoluteFilePath);
    const result = ts.parseConfigFileTextToJson(absoluteFilePath, fileSystemHost.readFileSync(absoluteFilePath));

    if (result.error != null)
        throw new Error(result.error.messageText.toString());

    const settings = ts.convertCompilerOptionsFromJson(result.config.compilerOptions, FileUtils.getDirPath(filePath));

    if (!settings.options)
        throw new Error(getErrorMessage(settings.errors));

    return settings.options;
}

function getErrorMessage(errors: ts.Diagnostic[]) {
    let message = "";
    errors.forEach(err => message += `${err.messageText}\n`);
    return message;
}

function verifyFileExists(fileSystemHost: FileSystemHost, filePath: string) {
    // unfortunately the ts compiler doesn't do things asynchronously so for now we won't either
    if (!fileSystemHost.fileExistsSync(filePath))
        throw new FileNotFoundError(filePath);
}
