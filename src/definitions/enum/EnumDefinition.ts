import * as ts from "typescript";
import {TsEnumDeclaration} from "./../../compiler";
import {BaseNodedDefinition, NamedDefinition} from "./../base";

export class EnumDefinition extends NamedDefinition(BaseNodedDefinition)<ts.EnumDeclaration, TsEnumDeclaration> {
    addMember() {
    }
}
