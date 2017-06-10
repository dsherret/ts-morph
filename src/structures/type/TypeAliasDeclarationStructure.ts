import {NamedStructure, TypedStructure} from "./../base";

export interface TypeAliasDeclarationStructure extends NamedStructure, TypedStructure {
    type: string; // made required from base
}
