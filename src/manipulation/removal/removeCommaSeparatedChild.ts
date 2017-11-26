import * as ts from "typescript";
import {Node} from "./../../compiler";
import {removeChildren} from "./removeChildren";

export interface RemoveCommaSeparatedChildOptions {
    removePrecedingSpaces?: boolean;
}

export function removeCommaSeparatedChild(child: Node, opts?: RemoveCommaSeparatedChildOptions) {
    const {removePrecedingSpaces = undefined} = opts || {};
    const childrenToRemove: Node[] = [child];
    const syntaxList = child.getParentSyntaxListOrThrow();

    addNextCommaIfAble();
    addPreviousCommaIfAble();

    removeChildren({
        children: childrenToRemove,
        removePrecedingSpaces: removePrecedingSpaces == null ? true : removePrecedingSpaces,
        removeFollowingSpaces: childrenToRemove[0] === syntaxList.getFirstChild()
    });

    function addNextCommaIfAble() {
        const commaToken = child.getNextSiblingIfKind(ts.SyntaxKind.CommaToken);

        if (commaToken != null)
            childrenToRemove.push(commaToken);
    }

    function addPreviousCommaIfAble() {
        if (syntaxList.getLastChild() !== childrenToRemove[childrenToRemove.length - 1])
            return;

        const precedingComma = child.getPreviousSiblingIfKind(ts.SyntaxKind.CommaToken);
        if (precedingComma != null)
            childrenToRemove.unshift(precedingComma);
    }
}
