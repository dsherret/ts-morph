import {JSDocableNodeStructure} from "./../base";

export interface IndexSignatureDeclarationStructure extends JSDocableNodeStructure {
    keyName?: string;
    keyType?: string;
    returnType: string;
}
