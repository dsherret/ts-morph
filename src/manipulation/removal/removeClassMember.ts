import {Node, OverloadableNode, ClassDeclaration} from "./../../compiler";
import {getClassMemberFormatting} from "./../formatting";
import {removeChildrenWithFormatting} from "./removeChildrenWithFormatting";
import {removeChildren} from "./removeChildren";

export function removeOverloadableClassMember(classMember: Node & OverloadableNode) {
    if (classMember.isOverload()) {
        if ((classMember.getParentOrThrow() as ClassDeclaration).isAmbient())
            removeClassMember(classMember);
        else
            removeChildren({ children: [classMember], removeFollowingSpaces: true, removeFollowingNewLines: true });
    }
    else
        removeClassMembers([...classMember.getOverloads(), classMember]);
}

export function removeClassMember(classMember: Node) {
    removeClassMembers([classMember]);
}

export function removeClassMembers(classMembers: Node[]) {
    removeChildrenWithFormatting({
        getSiblingFormatting: getClassMemberFormatting,
        children: classMembers
    });
}
