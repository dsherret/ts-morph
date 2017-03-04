import * as ts from "typescript";
import {applyMixins} from "./../../utils";
import {TsEnumNode} from "./../../compiler-new";
import {BaseDefinition, BaseNodedDefinition} from "./../base";

export class EnumDefinition extends BaseNodedDefinition<ts.EnumDeclaration, TsEnumNode> {
    getName() {
        return this.tsNode.getNameNode().getText();
    }

    setName(text: string) {
        this.tsNode.getNameNode().setText()
        return this;
    }
}
