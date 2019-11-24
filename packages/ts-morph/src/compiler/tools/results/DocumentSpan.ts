import { Memoize, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { SourceFile, Node } from "../../ast";
import { TextSpan } from "./TextSpan";

/**
 * Document span.
 */
export class DocumentSpan<TCompilerObject extends ts.DocumentSpan = ts.DocumentSpan> {
    /** @internal */
    protected readonly _context: ProjectContext;
    /** @internal */
    protected readonly _compilerObject: TCompilerObject;
    /** @internal */
    protected readonly _sourceFile: SourceFile;

    /**
     * @private
     */
    constructor(context: ProjectContext, compilerObject: TCompilerObject) {
        this._context = context;
        this._compilerObject = compilerObject;

        // store this node so that it's start doesn't go out of date because of manipulation (though the text span may)
        // Note: this will cause the source file to transitively hold a reference to this node and so it won't be released
        // from the WeakMap until a manipulation happens on the source file.
        this._sourceFile = this._context.compilerFactory
            .getSourceFileFromCacheFromFilePath(context.fileSystemWrapper.getStandardizedAbsolutePath(this.compilerObject.fileName))!;
        this._sourceFile._doActionPreNextModification(() => this.getNode());
    }

    /**
     * Gets the compiler object.
     */
    get compilerObject() {
        return this._compilerObject;
    }

    /**
     * Gets the source file this reference is in.
     */
    getSourceFile(): SourceFile {
        return this._sourceFile;
    }

    /**
     * Gets the text span.
     */
    @Memoize
    getTextSpan() {
        return new TextSpan(this.compilerObject.textSpan);
    }

    /**
     * Gets the node at the start of the text span.
     */
    @Memoize
    getNode() {
        const textSpan = this.getTextSpan();
        const sourceFile = this.getSourceFile();
        const start = textSpan.getStart();
        const width = textSpan.getEnd();

        return findBestMatchingNode();

        function findBestMatchingNode() {
            // more relaxed getDescendantAtStartWithWidth because the position may be within a string literal
            let bestNode: Node | undefined;

            sourceFile._context.compilerFactory.forgetNodesCreatedInBlock(remember => {
                let foundNode: Node | undefined;
                let nextNode: Node | undefined = sourceFile;

                while (nextNode != null) {
                    if (foundNode == null)
                        bestNode = nextNode;
                    if (nextNode.getStart() === start && nextNode.getWidth() === width)
                        bestNode = foundNode = nextNode;
                    else if (foundNode != null)
                        break; // no need to keep looking
                    nextNode = nextNode.getChildAtPos(start);
                }

                if (bestNode != null)
                    remember(bestNode);
            });

            return bestNode!;
        }
    }

    /**
     * Gets the original text span if the span represents a location that was remapped.
     */
    @Memoize
    getOriginalTextSpan() {
        const { originalTextSpan } = this.compilerObject;
        return originalTextSpan == null ? undefined : new TextSpan(originalTextSpan);
    }

    /**
     * Gets the original file name if the span represents a location that was remapped.
     */
    getOriginalFileName() {
        return this.compilerObject.originalFileName;
    }
}
