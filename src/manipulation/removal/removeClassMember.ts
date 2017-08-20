import {Node, OverloadableNode} from "./../../compiler";
import {getClassMemberFormatting} from "./../formatting";
import {removeChildrenWithFormatting} from "./removeChildrenWithFormatting";

export function removeOverloadableClassMember(classMember: Node & OverloadableNode) {
    if (classMember.isOverload())
        removeClassMember(classMember);
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
