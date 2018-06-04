import { FileSystemWrapper } from "../fileSystem/FileSystemWrapper";
import { VirtualFileSystemHost } from "../fileSystem/VirtualFileSystemHost";
import { GlobalContainer } from "../GlobalContainer";
import { ManipulationSettings } from "../options";
import { CompilerOptions, ScriptTarget } from "../typescript";

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
