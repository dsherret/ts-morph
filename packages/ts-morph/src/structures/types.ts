import { StructureKind } from "./StructureKind";

export type OptionalKind<TStructure extends { kind?: StructureKind; }> = Pick<TStructure, Exclude<keyof TStructure, "kind">>
    & Partial<Pick<TStructure, "kind">>;
