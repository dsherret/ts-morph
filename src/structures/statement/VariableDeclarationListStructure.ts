import { VariableDeclarationKind } from "../../compiler";
import { Structure } from "../Structure";
import { VariableDeclarationStructure } from "./VariableDeclarationStructure";

export interface VariableDeclarationListStructure extends Structure, VariableDeclarationListSpecificStructure {
}

export interface VariableDeclarationListSpecificStructure {
    declarationKind?: VariableDeclarationKind;
    declarations: VariableDeclarationStructure[];
}
