import * as ts from "typescript";
import {SourceFile} from "./../compiler";
import {GlobalContainer} from "./../GlobalContainer";
import {VirtualFileSystemHost} from "./../fileSystem/VirtualFileSystemHost";

export function createTempSourceFile(filePath: string, sourceText: string, opts: { createLanguageService?: boolean; compilerOptions?: ts.CompilerOptions; } = {}) {
    const {createLanguageService = false, compilerOptions = { target: ts.ScriptTarget.Latest }} = opts;
    const globalContainer = new GlobalContainer(new VirtualFileSystemHost(), compilerOptions, { createLanguageService });
    return globalContainer.compilerFactory.createSourceFileFromText(filePath, sourceText);
}
