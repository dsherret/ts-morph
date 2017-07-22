import * as ts from "typescript";
import {GlobalContainer} from "./../../../GlobalContainer";
import {Node, SourceFile} from "./../../../compiler";
import {Memoize} from "./../../../utils";
import {TextSpan} from "./TextSpan";

/**
 * Document span.
 */
export class DocumentSpan<TCompilerObject extends ts.DocumentSpan = ts.DocumentSpan> {
    /** @internal */
    protected readonly global: GlobalContainer;
    /** @internal */
    private readonly _compilerObject: TCompilerObject;

    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: TCompilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;
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
        return this.global.compilerFactory.getSourceFileFromFilePath(this.compilerObject.fileName)!;
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
    getNode(): Node {
        return this.getSourceFile().getDescendantAtPos(this.getTextSpan().getStart())!;
    }
}
