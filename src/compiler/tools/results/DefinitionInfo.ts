import { Node } from "../../../compiler";
import { ProjectContext } from "../../../ProjectContext";
import { SyntaxKind, ts } from "../../../typescript";
import { Memoize } from "../../../utils";
import { DocumentSpan } from "./DocumentSpan";

/**
 * Definition info.
 */
export class DefinitionInfo<TCompilerObject extends ts.DefinitionInfo = ts.DefinitionInfo> extends DocumentSpan<TCompilerObject> {
    /**
     * @internal
     */
    constructor(context: ProjectContext, compilerObject: TCompilerObject) {
        super(context, compilerObject);

        // fill memoize
        this.getDeclarationNode();
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
