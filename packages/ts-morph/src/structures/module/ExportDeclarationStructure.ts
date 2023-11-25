import { WriterFunction } from "../../types";
import { KindedStructure, Structure } from "../Structure.generated";
import { StructureKind } from "../StructureKind";
import { OptionalKind } from "../types";
import { ExportSpecifierStructure } from "./ExportSpecifierStructure";
import { ImportAttributeStructure } from "./ImportAttributeStructure";

export interface ExportDeclarationStructure extends Structure, ExportDeclarationSpecificStructure {
}

export interface ExportDeclarationSpecificStructure extends KindedStructure<StructureKind.ExportDeclaration> {
  isTypeOnly?: boolean;
  namespaceExport?: string;
  namedExports?: (string | OptionalKind<ExportSpecifierStructure> | WriterFunction)[] | WriterFunction;
  moduleSpecifier?: string;
  attributes?: OptionalKind<ImportAttributeStructure>[] | undefined;
}
