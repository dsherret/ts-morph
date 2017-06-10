import {NamedStructure, DocumentationableStructure} from "./../base";

export interface EnumMemberStructure extends NamedStructure, DocumentationableStructure {
    value?: number;
}
