import * as ts from "typescript";
import {applyMixins} from "./../../utils";
import {TsSourceFile, TsEnumDeclaration} from "./../../compiler";
import {BaseDefinition, BaseNodedDefinition} from "./../base";

export class SourceFileDefinition extends BaseNodedDefinition<ts.SourceFile, TsSourceFile> {
    getFileName() {
        return this.tsNode.getFileName();
    }

    getEnums() {
        return this.tsNode.getChildren().filter(c => c instanceof TsEnumDeclaration).map(c => this.factory.getEnum(c as any as TsEnumDeclaration));
    }

    getText() {
        return this.tsNode.getText();
    }
}
