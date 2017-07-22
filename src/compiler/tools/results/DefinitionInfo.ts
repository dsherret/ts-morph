import * as ts from "typescript";
import {GlobalContainer} from "./../../../GlobalContainer";
import {SourceFile} from "./../../../compiler";
import {Memoize} from "./../../../utils";
import {TextSpan} from "./TextSpan";

/**
 * Definition info.
 */
export class DefinitionInfo<TCompilerObject extends ts.DefinitionInfo = ts.DefinitionInfo> {
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
     * Gets the kind.
     */
    getKind() {
        return this.compilerObject.kind;
    }

    /**
     * Gets the name.
     */
    getName() {
        return this.compilerObject.name;
    }

    /**
     * Gets the container kind.
     */
    getContainerKind() {
        return this.compilerObject.containerKind;
    }

    /**
     * Gets the container name.
     */
    getContainerName() {
        return this.compilerObject.containerName;
    }
}
