import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node, SourceFile} from "./../../compiler";
import {CompilerFactory} from "./../../factories";
import {UnwrapParentHandler, ParentFinderReplacementNodeHandler} from "./nodeHandlers";

export interface ReplaceTreeUnwrappingNodeOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
    childIndex: number;
}

export function replaceTreeUnwrappingNode(opts: ReplaceTreeUnwrappingNodeOptions) {
    const {parent: changingParent, childIndex, replacementSourceFile} = opts;
    const sourceFile = changingParent.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const unwrapParentHandler = new UnwrapParentHandler(compilerFactory, childIndex);

    if (changingParent === sourceFile)
        unwrapParentHandler.handleNode(sourceFile, replacementSourceFile);
    else {
        const parentFinderReplacement = new ParentFinderReplacementNodeHandler(compilerFactory, unwrapParentHandler, changingParent);
        parentFinderReplacement.handleNode(sourceFile, replacementSourceFile);
    }
}
