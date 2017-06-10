import {NamedStructure, DocumentationableNodeStructure, InitializerExpressionableNodeStructure} from "./../base";

export interface EnumMemberStructure extends NamedStructure, DocumentationableNodeStructure, InitializerExpressionableNodeStructure {
    value?: number;
}
