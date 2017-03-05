import * as ts from "typescript";
import {applyMixins} from "./../../utils";
import {TsEnumDeclaration} from "./../../compiler";
import {BaseDefinition, BaseNodedDefinition} from "./../base";

export class EnumDefinition extends BaseNodedDefinition<ts.EnumDeclaration, TsEnumDeclaration> {
    getName() {
        return this.tsNode.getNameNode().getText();
    }

    setName(text: string) {
        this.tsNode.getNameNode().rename(text);
        return this;
    }
}
