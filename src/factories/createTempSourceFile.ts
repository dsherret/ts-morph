import { FileSystemWrapper } from "../fileSystem/FileSystemWrapper";
import { VirtualFileSystemHost } from "../fileSystem/VirtualFileSystemHost";
import { ProjectContext } from "../ProjectContext";
import { ManipulationSettings } from "../options";
import { CompilerOptions, ScriptTarget } from "../typescript";

export interface CreateTempSourceFileOptions {
    createLanguageService?: boolean;
    compilerOptions?: CompilerOptions;
    manipulationSettings?: ManipulationSettings;
}

export function createTempSourceFile(filePath: string, sourceText: string, opts: CreateTempSourceFileOptions = {}) {
    const {createLanguageService = false, compilerOptions = { target: ScriptTarget.Latest }} = opts;
    const projectContext = new ProjectContext(new FileSystemWrapper(new VirtualFileSystemHost()), compilerOptions, { createLanguageService });
    if (opts.manipulationSettings != null)
        projectContext.manipulationSettings.set(opts.manipulationSettings);
    return projectContext.compilerFactory.createSourceFileFromText(filePath, sourceText, {});
}
