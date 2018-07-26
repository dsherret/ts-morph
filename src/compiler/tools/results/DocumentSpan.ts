import { SourceFile } from "../../../compiler";
import { ProjectContext } from "../../../ProjectContext";
import { ts } from "../../../typescript";
import { Memoize } from "../../../utils";
import { TextSpan } from "./TextSpan";

/**
 * Document span.
 */
export class DocumentSpan<TCompilerObject extends ts.DocumentSpan = ts.DocumentSpan> {
    /** @internal */
    protected readonly context: ProjectContext;
    /** @internal */
    protected readonly _compilerObject: TCompilerObject;
    /** @internal */
    protected readonly sourceFile: SourceFile;

    /**
     * @internal
     */
    constructor(context: ProjectContext, compilerObject: TCompilerObject) {
        this.context = context;
        this._compilerObject = compilerObject;

        // store this node so that it's start doesn't go out of date because of manipulation (though the text span may)
        this.sourceFile = this.context.compilerFactory.getSourceFileFromCacheFromFilePath(this.compilerObject.fileName)!;
        // fill the memoize
        this.getNode();
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
        return this.sourceFile;
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
        return this.getSourceFile().getDescendantAtStartWithWidth(this.getTextSpan().getStart(), this.getTextSpan().getLength())!;
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
