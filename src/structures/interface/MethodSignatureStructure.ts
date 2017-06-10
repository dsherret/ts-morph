import {NamedStructure, ReturnTypedNodeStructure, QuestionTokenableNodeStructure, DocumentationableNodeStructure} from "./../base";
import {SignaturedDeclarationStructure} from "./../function";

export interface MethodSignatureStructure
    extends NamedStructure, ReturnTypedNodeStructure, QuestionTokenableNodeStructure, DocumentationableNodeStructure, SignaturedDeclarationStructure
{
}
