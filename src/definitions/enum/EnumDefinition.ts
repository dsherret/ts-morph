import * as ts from "typescript";
import {applyMixins} from "./../../utils";
import {TsEnumNode} from "./../../compiler";
import {BaseDefinition, BaseNodedDefinition} from "./../base";

export class EnumDefinition extends BaseNodedDefinition<ts.EnumDeclaration, TsEnumNode> {
    getName() {
        return this.tsNode.getNameNode().getText();
    }

    setName(text: string) {
        this.tsNode.setNameText
        return this;
    }
}
