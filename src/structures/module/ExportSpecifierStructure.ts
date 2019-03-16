import { Structure } from "../Structure";

export interface ExportSpecifierStructure extends Structure, ExportSpecifierSpecificStructure {
}

export interface ExportSpecifierSpecificStructure {
    name: string;
    alias?: string;
}