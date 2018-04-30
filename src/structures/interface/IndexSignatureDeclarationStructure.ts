import { CodeBlockWriter } from "../../codeBlockWriter";
import { JSDocableNodeStructure, ReadonlyableNodeStructure } from "../base";

export interface IndexSignatureDeclarationStructure extends JSDocableNodeStructure, ReadonlyableNodeStructure {
    keyName?: string;
    keyType?: string;
    returnType: string | ((writer: CodeBlockWriter) => void);
}
