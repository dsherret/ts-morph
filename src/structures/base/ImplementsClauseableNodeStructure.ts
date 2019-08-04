import { WriterFunction } from "../../types";

export interface ImplementsClauseableNodeStructure {
    implements?: (string | WriterFunction)[] | WriterFunction;
}
