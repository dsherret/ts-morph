import { Node } from "../../compiler";
import { getClassMemberFormatting } from "./getClassMemberFormatting";
import { getInterfaceMemberFormatting } from "./getInterfaceMemberFormatting";
import { getStatementedNodeChildFormatting } from "./getStatementedNodeChildFormatting";

export function getGeneralFormatting(parent: Node, child: Node) {
    // todo: support more
    if (Node.isClassDeclaration(parent))
        return getClassMemberFormatting(parent, child);
    if (Node.isInterfaceDeclaration(parent))
        return getInterfaceMemberFormatting(parent, child);

    // todo: don't assume it's a statemented node here
    return getStatementedNodeChildFormatting(parent, child);
}
