import * as ts from "typescript";
import {SourceFile} from "./../compiler";
import {GlobalContainer} from "./../GlobalContainer";
import {ManipulationSettings} from "./../ManipulationSettings";
import {VirtualFileSystemHost} from "./../fileSystem/VirtualFileSystemHost";

export interface CreateTempSourceFileOptions {
    createLanguageService?: boolean;
    compilerOptions?: ts.CompilerOptions;
    manipulationSettings?: ManipulationSettings;
}

export function createTempSourceFile(filePath: string, sourceText: string, opts: CreateTempSourceFileOptions = {}) {
    const {createLanguageService = false, compilerOptions = { target: ts.ScriptTarget.Latest }} = opts;
    const globalContainer = new GlobalContainer(new VirtualFileSystemHost(), compilerOptions, { createLanguageService });
    if (opts.manipulationSettings != null)
        globalContainer.manipulationSettings.set(opts.manipulationSettings);
    return globalContainer.compilerFactory.createSourceFileFromText(filePath, sourceText);
}
