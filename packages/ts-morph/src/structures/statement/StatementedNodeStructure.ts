import { WriterFunction } from "../../types";
import { StatementStructures } from "../aliases";

export interface StatementedNodeStructure {
    statements?: (string | WriterFunction | StatementStructures)[] | string | WriterFunction;
}
