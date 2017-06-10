import {NamedStructure} from "./../base";
import {EnumMemberStructure} from "./EnumMemberStructure";

export interface EnumDeclarationStructure extends NamedStructure, EnumDeclarationSpecificStructure {
}

export interface EnumDeclarationSpecificStructure {
    isConst?: boolean;
    members?: EnumMemberStructure[];
}
