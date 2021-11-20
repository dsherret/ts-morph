import { WriterFunction } from "../../types";
import { KindedStructure, Structure } from "../Structure";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";
import { AssertEntryStructure } from "./AssertEntryStructure";
import { ExportSpecifierStructure } from "./ExportSpecifierStructure";

export interface ExportDeclarationStructure extends Structure, ExportDeclarationSpecificStructure {
}

export interface ExportDeclarationSpecificStructure extends KindedStructure<StructureKind.ExportDeclaration> {
  isTypeOnly?: boolean;
  namespaceExport?: string;
  namedExports?: (string | OptionalKind<ExportSpecifierStructure> | WriterFunction)[] | WriterFunction;
  moduleSpecifier?: string;
  assertElements?: OptionalKind<AssertEntryStructure>[] | undefined;
}
