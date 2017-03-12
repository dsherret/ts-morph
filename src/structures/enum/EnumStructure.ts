import {NamedStructure} from "./../base";
import {EnumMemberStructure} from "./EnumMemberStructure";

export interface EnumStructure extends NamedStructure {
    members?: EnumMemberStructure[];
}
