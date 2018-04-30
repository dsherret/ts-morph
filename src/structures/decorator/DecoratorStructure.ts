import { WriterFunction } from "../../types";

export interface DecoratorStructure {
    name: string;
    arguments?: (string | WriterFunction)[];
}
