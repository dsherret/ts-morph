import * as ts from "typescript";
import {TsNode} from "./../common";
import {TsNamedNode} from "./../base";

export class TsEnumDeclaration extends TsNamedNode(TsNode)<ts.EnumDeclaration> {
}
