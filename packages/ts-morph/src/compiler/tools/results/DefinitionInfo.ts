import { Memoize, SyntaxKind, ts } from "@ts-morph/common";
import { ProjectContext } from "../../../ProjectContext";
import { Node } from "../../ast";
import { DocumentSpan } from "./DocumentSpan";

/**
 * Definition info.
 */
export class DefinitionInfo<TCompilerObject extends ts.DefinitionInfo = ts.DefinitionInfo> extends DocumentSpan<TCompilerObject> {
    /**
     * @private
     */
    constructor(context: ProjectContext, compilerObject: TCompilerObject) {
        super(context, compilerObject);

        // fill memoize before the source file is modified
        this.getSourceFile()._doActionPreNextModification(() => this.getDeclarationNode());
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
     * Gets the declaration node.
     */
    @Memoize
    getDeclarationNode(): Node | undefined {
        if (this.getKind() === "module" && this.getTextSpan().getLength() === this.getSourceFile().getFullWidth())
            return this.getSourceFile();

        const start = this.getTextSpan().getStart();
        const identifier = findIdentifier(this.getSourceFile());

        return identifier == null ? undefined : identifier.getParentOrThrow();

        function findIdentifier(node: Node): Node | undefined {
            if (node.getKind() === SyntaxKind.Identifier && node.getStart() === start)
                return node;

            for (const child of node._getChildrenIterator()) {
                if (child.getPos() <= start && child.getEnd() >= start)
                    return findIdentifier(child);
            }

            return undefined;
        }
    }
}
