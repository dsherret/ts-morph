import {NamedStructure} from "./../base";
import {EnumMemberStructure} from "./EnumMemberStructure";

export interface EnumDeclarationStructure extends NamedStructure {
    isConst?: boolean;
    members?: EnumMemberStructure[];
}
