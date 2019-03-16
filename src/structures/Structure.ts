import { StructureKind } from "./StructureKind";

export interface Structure<TKind extends StructureKind> {
    kind: TKind;
}
