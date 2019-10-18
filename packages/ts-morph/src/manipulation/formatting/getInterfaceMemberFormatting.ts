import { InterfaceDeclaration, Node } from "../../compiler";
import { FormattingKind } from "./FormattingKind";

export function getInterfaceMemberFormatting(parent: InterfaceDeclaration, member: Node) {
    return FormattingKind.Newline;
}
