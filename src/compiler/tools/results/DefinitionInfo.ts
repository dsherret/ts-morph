import {GlobalContainer} from "../../../GlobalContainer";
import {ts, SyntaxKind} from "../../../typescript";
import {SourceFile, Node} from "../../../compiler";
import {Memoize} from "../../../utils";
import {TextSpan} from "./TextSpan";

/**
 * Definition info.
 */
export class DefinitionInfo<TCompilerObject extends ts.DefinitionInfo = ts.DefinitionInfo> {
    /** @internal */
    protected readonly global: GlobalContainer;
    /** @internal */
    private readonly _compilerObject: TCompilerObject;
    /** @internal */
    private readonly sourceFile: SourceFile;

    /**
     * @internal
     */
    constructor(global: GlobalContainer, compilerObject: TCompilerObject) {
        this.global = global;
        this._compilerObject = compilerObject;
        this.sourceFile = this.global.compilerFactory.getSourceFileFromCacheFromFilePath(this.compilerObject.fileName)!;
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

    /**
     * Gets the definition node.
     */
    getNode(): Node | undefined {
        const start = this.getTextSpan().getStart();
        const identifier = findIdentifier(this.getSourceFile());

        return identifier == null ? undefined : identifier.getParentOrThrow();

        function findIdentifier(node: Node): Node | undefined {
            if (node.getKind() === SyntaxKind.Identifier && node.getStart() === start)
                return node;

            for (const child of node.getChildrenIterator()) {
                if (child.getPos() <= start && child.getEnd() >= start)
                    return findIdentifier(child);
            }

            return undefined;
        }
    }
}
