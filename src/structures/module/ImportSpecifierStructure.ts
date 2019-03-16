import { Structure } from "../Structure";

export interface ImportSpecifierStructure extends Structure, ImportSpecifierSpecificStructure {
}

export interface ImportSpecifierSpecificStructure {
    name: string;
    alias?: string;
}
