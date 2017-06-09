import {NamedStructure, TypedStructure} from "./../base";

export interface TypeAliasStructure extends NamedStructure, TypedStructure {
    type: string; // made required from base
}
