import {Node} from "./../../compiler";
import {doManipulation} from "./../doManipulation";
import {RemoveChildrenTextManipulator} from "./../textManipulators";
import {NodeHandlerFactory} from "./../nodeHandlers";

export interface RemoveChildrenOptions {
    children: Node[];
    removePrecedingSpaces?: boolean;
    removeFollowingSpaces?: boolean;
    removePrecedingNewLines?: boolean;
    removeFollowingNewLines?: boolean;
}

export function removeChildren(opts: RemoveChildrenOptions) {
    const {children} = opts;
    if (children.length === 0)
        return;

    doManipulation(children[0].getSourceFile(),
        new RemoveChildrenTextManipulator(opts),
        new NodeHandlerFactory().getForChildIndex({
            parent: children[0].getParentSyntaxList() || children[0].getParentOrThrow(),
            childIndex: children[0].getChildIndex(),
            childCount: -1 * children.length
        }));
}
