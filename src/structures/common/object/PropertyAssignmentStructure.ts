import { CodeBlockWriter } from "../../../codeBlockWriter";
import { PropertyNamedNodeStructure } from "../../base";

export interface PropertyAssignmentStructure extends PropertyNamedNodeStructure {
    initializer: string | ((writer: CodeBlockWriter) => void);
}
