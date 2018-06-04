import { Node } from "../../compiler";
import { TypeGuards } from "../../utils";
import { getClassMemberFormatting } from "./getClassMemberFormatting";
import { getInterfaceMemberFormatting } from "./getInterfaceMemberFormatting";
import { getStatementedNodeChildFormatting } from "./getStatementedNodeChildFormatting";

export function getGeneralFormatting(parent: Node, child: Node) {
    // todo: support more
    if (TypeGuards.isClassDeclaration(parent))
        return getClassMemberFormatting(parent, child);
    if (TypeGuards.isInterfaceDeclaration(parent))
        return getInterfaceMemberFormatting(parent, child);

    // todo: don't assume it's a statemented node here
    return getStatementedNodeChildFormatting(parent, child);
}
