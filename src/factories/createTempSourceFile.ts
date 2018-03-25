import {ts, CompilerOptions, ScriptTarget} from "../typescript";
import {SourceFile} from "../compiler";
import {GlobalContainer} from "../GlobalContainer";
import {ManipulationSettings} from "../options";
import {VirtualFileSystemHost} from "../fileSystem/VirtualFileSystemHost";
import {FileSystemWrapper} from "../fileSystem/FileSystemWrapper";

export interface CreateTempSourceFileOptions {
    createLanguageService?: boolean;
    compilerOptions?: CompilerOptions;
    manipulationSettings?: ManipulationSettings;
}

export function createTempSourceFile(filePath: string, sourceText: string, opts: CreateTempSourceFileOptions = {}) {
    const {createLanguageService = false, compilerOptions = { target: ScriptTarget.Latest }} = opts;
    const globalContainer = new GlobalContainer(new FileSystemWrapper(new VirtualFileSystemHost()), compilerOptions, { createLanguageService });
    if (opts.manipulationSettings != null)
        globalContainer.manipulationSettings.set(opts.manipulationSettings);
    return globalContainer.compilerFactory.createSourceFileFromText(filePath, sourceText, {});
}
