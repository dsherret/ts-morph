import { WriterFunction } from "../../types";
import { JSDocableNodeStructure, ReadonlyableNodeStructure } from "../base";

export interface IndexSignatureDeclarationStructure extends IndexSignatureDeclarationSpecificStructure, JSDocableNodeStructure,
    ReadonlyableNodeStructure {
}

export interface IndexSignatureDeclarationSpecificStructure {
    keyName?: string;
    keyType?: string;
    returnType: string | WriterFunction;
}
