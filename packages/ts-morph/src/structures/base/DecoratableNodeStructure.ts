import { DecoratorStructure } from "../decorator";
import { OptionalKind } from "../types";

export interface DecoratableNodeStructure {
    decorators?: OptionalKind<DecoratorStructure>[];
}
