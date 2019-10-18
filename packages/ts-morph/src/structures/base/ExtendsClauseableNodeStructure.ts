import { WriterFunction } from "../../types";

export interface ExtendsClauseableNodeStructure {
    extends?: (string | WriterFunction)[] | WriterFunction;
}
