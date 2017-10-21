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
    /** @internal */
    private readonly node: Node;

    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: TCompilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;

        // get the parent most, non-syntax tree, non-source file at the given position
        // todo: could make this faster by only going down the tree instead of going down then up
        let node = this.getSourceFile().getDescendantAtPos(this.getTextSpan().getStart())!;
        let nodeParent = node.getParent();
        while (nodeParent != null && nodeParent.getStart() === node.getStart() && nodeParent.getKind() !== ts.SyntaxKind.SourceFile) {
            node = nodeParent;
            nodeParent = node.getParent();
        }

        // store this node so that it's start doesn't go out of date because of manipulation (though the text span may)
        this.node = node;
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
    getNode() {
        return this.node;
    }
}
