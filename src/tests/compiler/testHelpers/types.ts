import { Structure, StructureKind } from "../../../structures";

export type OptionalKindAndTrivia<T extends Structure & { kind?: StructureKind; }> = Omit<T, "kind" | "leadingTrivia" | "trailingTrivia">
    & Partial<Pick<T, "kind" | "leadingTrivia" | "trailingTrivia">>;

export type OptionalTrivia<T extends Structure> = Omit<T, "leadingTrivia" | "trailingTrivia">
    & Partial<Pick<T, "leadingTrivia" | "trailingTrivia">>;
