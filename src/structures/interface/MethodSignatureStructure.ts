import {PropertyNamedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure} from "./../base";
import {SignaturedDeclarationStructure} from "./../function";

export interface MethodSignatureStructure
    extends PropertyNamedNodeStructure, QuestionTokenableNodeStructure, JSDocableNodeStructure, SignaturedDeclarationStructure
{
}
