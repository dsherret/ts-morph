import {NamedStructure, QuestionTokenableNodeStructure, DocumentationableNodeStructure} from "./../base";
import {SignaturedDeclarationStructure} from "./../function";

export interface MethodSignatureStructure
    extends NamedStructure, QuestionTokenableNodeStructure, DocumentationableNodeStructure, SignaturedDeclarationStructure
{
}
