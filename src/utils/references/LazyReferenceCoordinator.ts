import {CompilerFactory} from "../../factories";
import {SourceFile} from "../../compiler";
import {createHashSet} from "../collections";

/**
 * Updates all the source file's reference containers.
 */
export class LazyReferenceCoordinator {
    private dirtySourceFiles = createHashSet<SourceFile>();

    constructor(factory: CompilerFactory) {
        factory.onSourceFileAdded(sourceFile => {
            this.dirtySourceFiles.add(sourceFile);
            sourceFile.onModified(() => {
                if (!sourceFile.wasForgotten())
                    this.dirtySourceFiles.add(sourceFile);
            });
        });
        factory.onSourceFileRemoved(sourceFile => {
            sourceFile._referenceContainer.clear();
            this.dirtySourceFiles.delete(sourceFile);
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

    clearDirtySourceFiles() {
        this.dirtySourceFiles.clear();
    }

    clearDityForSourceFile(sourceFile: SourceFile) {
        this.dirtySourceFiles.delete(sourceFile);
    }
}
