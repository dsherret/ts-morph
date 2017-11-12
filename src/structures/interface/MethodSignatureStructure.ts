import {PropertyNamedNodeStructure, QuestionTokenableNodeStructure, DocumentationableNodeStructure} from "./../base";
import {SignaturedDeclarationStructure} from "./../function";

export interface MethodSignatureStructure
    extends PropertyNamedNodeStructure, QuestionTokenableNodeStructure, DocumentationableNodeStructure, SignaturedDeclarationStructure
{
}
