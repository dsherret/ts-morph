import {NamedStructure} from "./../base";
import {EnumMemberStructure} from "./EnumMemberStructure";

export interface EnumStructure extends NamedStructure {
    isConst?: boolean;
    members?: EnumMemberStructure[];
}
