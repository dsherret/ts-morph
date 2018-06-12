import { NamedNodeStructure } from "../base";

export interface TypeParameterDeclarationStructure extends NamedNodeStructure {
    constraint?: string;
    default?: string;
}
