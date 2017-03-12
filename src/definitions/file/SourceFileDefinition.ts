import * as ts from "typescript";
import {TsSourceFile, TsEnumDeclaration} from "./../../compiler";
import {EnumStructure} from "./../../structures";
import {BaseDefinition, BaseNodedDefinition} from "./../base";

export class SourceFileDefinition extends BaseNodedDefinition<ts.SourceFile, TsSourceFile> {
    getFileName() {
        return this.tsNode.getFileName();
    }

    getEnums() {
        return this.tsNode.getMainChildren()
            .filter(c => c instanceof TsEnumDeclaration)
            .map(c => this.factory.getEnum(c as TsEnumDeclaration));
    }

    getFullText() {
        return this.tsNode.getFullText();
    }

    addEnum(structure: EnumStructure) {
        return this.factory.getEnum(this.tsNode.addEnumDeclaration(structure));
    }
}
