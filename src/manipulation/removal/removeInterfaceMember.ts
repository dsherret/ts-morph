import {Node} from "./../../compiler";
import {getInterfaceMemberFormatting} from "./../formatting";
import {removeChildrenWithFormatting} from "./removeChildrenWithFormatting";

export function removeInterfaceMember(classMember: Node) {
    removeInterfaceMembers([classMember]);
}

export function removeInterfaceMembers(classMembers: Node[]) {
    removeChildrenWithFormatting({
        getSiblingFormatting: getInterfaceMemberFormatting,
        children: classMembers
    });
}
