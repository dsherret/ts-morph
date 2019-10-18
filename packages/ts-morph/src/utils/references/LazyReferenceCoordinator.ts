import { SourceFile } from "../../compiler";
import { CompilerFactory } from "../../factories";

/**
 * Updates all the source file's reference containers.
 */
export class LazyReferenceCoordinator {
    private dirtySourceFiles = new Set<SourceFile>();

    constructor(factory: CompilerFactory) {
        const onSourceFileModified = (sourceFile: SourceFile) => {
            if (!sourceFile.wasForgotten())
                this.dirtySourceFiles.add(sourceFile);
        };

        factory.onSourceFileAdded(sourceFile => {
            this.dirtySourceFiles.add(sourceFile);
            sourceFile.onModified(onSourceFileModified);
        });
        factory.onSourceFileRemoved(sourceFile => {
            sourceFile._referenceContainer.clear();
            this.dirtySourceFiles.delete(sourceFile);
            sourceFile.onModified(onSourceFileModified, false);
        });
    }

    refreshDirtySourceFiles() {
        for (const sourceFile of this.dirtySourceFiles.values())
            sourceFile._referenceContainer.refresh();
        this.clearDirtySourceFiles();
    }

    refreshSourceFileIfDirty(sourceFile: SourceFile) {
        if (!this.dirtySourceFiles.has(sourceFile))
            return;
        sourceFile._referenceContainer.refresh();
        this.clearDityForSourceFile(sourceFile);
    }

    addDirtySourceFile(sourceFile: SourceFile) {
        this.dirtySourceFiles.add(sourceFile);
    }

    clearDirtySourceFiles() {
        this.dirtySourceFiles.clear();
    }

    clearDityForSourceFile(sourceFile: SourceFile) {
        this.dirtySourceFiles.delete(sourceFile);
    }
}
