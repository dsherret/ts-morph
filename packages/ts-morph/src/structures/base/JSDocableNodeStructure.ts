import { JSDocStructure } from "../doc";
import { OptionalKind } from "../types";

export interface JSDocableNodeStructure {
    docs?: (OptionalKind<JSDocStructure> | string)[];
}
