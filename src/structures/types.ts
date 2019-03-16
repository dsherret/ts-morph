import { StructureKind } from "./StructureKind";

export type OptionalKind<TStructure extends { kind: StructureKind; }> = Omit<TStructure, "kind"> & Partial<Pick<TStructure, "kind">>;
