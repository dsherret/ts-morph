import { Node, InterfaceDeclaration } from "../../compiler";
import { FormattingKind } from "./FormattingKind";

export function getInterfaceMemberFormatting(parent: InterfaceDeclaration, member: Node) {
    return FormattingKind.Newline;
}
