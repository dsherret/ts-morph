import * as ts from "typescript";
import * as compiler from "./../compiler";
import * as definitions from "./../definitions";
import {KeyValueCache, Logger} from "./../utils";

export class DefinitionFactory {
    private readonly nodeCache = new KeyValueCache<compiler.TsNode<ts.Node>, definitions.BaseNodedDefinition<ts.Node, compiler.TsNode<ts.Node>>>();

    getSourceFile(tsSourceFile: compiler.TsSourceFile) {
        return this.nodeCache.getOrCreate<definitions.SourceFileDefinition>(tsSourceFile, () => new definitions.SourceFileDefinition(this, tsSourceFile));
    }

    getEnum(tsEnumDeclaration: compiler.TsEnumDeclaration) {
        return this.nodeCache.getOrCreate<definitions.EnumDefinition>(tsEnumDeclaration, () => new definitions.EnumDefinition(this, tsEnumDeclaration));
    }
}
