import { CodeBlockWriter } from "../../codeBlockWriter";

export interface DecoratorStructure {
    name: string;
    arguments?: (string | ((writer: CodeBlockWriter) => void))[];
}
