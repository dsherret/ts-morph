import { Structure, StructureKind } from "../../../structures";

export type OptionalKindAndTrivia<T extends Structure & { kind?: StructureKind }> =
  & Partial<Pick<T, "kind" | "leadingTrivia" | "trailingTrivia">>
  & Omit<T, "kind" | "leadingTrivia" | "trailingTrivia">;

export type OptionalTrivia<T extends Structure> =
  & Partial<Pick<T, "leadingTrivia" | "trailingTrivia">>
  & Omit<T, "leadingTrivia" | "trailingTrivia">;
