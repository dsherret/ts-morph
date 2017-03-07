import * as ts from "typescript";
import {TsSourceFile, TsEnumDeclaration} from "./../../compiler";
import {EnumStructure} from "./../../structures";
import {applyMixins} from "./../../utils";
import {BaseDefinition, BaseNodedDefinition} from "./../base";

export class SourceFileDefinition extends BaseNodedDefinition<ts.SourceFile, TsSourceFile> {
    getFileName() {
        return this.tsNode.getFileName();
    }

    getEnums() {
        return this.tsNode.getMainChildren().filter(c => c instanceof TsEnumDeclaration).map(c => this.factory.getEnum(c as any as TsEnumDeclaration));
    }

    getText() {
        return this.tsNode.getText();
    }

    addEnum(structure: EnumStructure) {
        const tsEnumDeclaration = this.factory.getCompilerFactory().createEnumDeclaration(structure);
        this.tsNode.addChild(tsEnumDeclaration);
        return this.factory.getEnum(tsEnumDeclaration);
    }
}
