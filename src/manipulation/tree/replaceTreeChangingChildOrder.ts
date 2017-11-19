import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node, SourceFile} from "./../../compiler";
import {CompilerFactory} from "./../../factories";
import {ChangeChildOrderParentHandler, ParentFinderReplacementNodeHandler} from "./nodeHandlers";

export interface ReplaceTreeChangingChildOrderOptions {
    replacementSourceFile: SourceFile;
    parent: Node;
    oldIndex: number;
    newIndex: number;
}

export function replaceTreeChangingChildOrder(opts: ReplaceTreeChangingChildOrderOptions) {
    const {parent: changingParent, oldIndex, newIndex, replacementSourceFile} = opts;
    const sourceFile = changingParent.getSourceFile();
    const compilerFactory = sourceFile.global.compilerFactory;
    const changeChildOrderParentHandler = new ChangeChildOrderParentHandler(compilerFactory, { oldIndex, newIndex });

    if (changingParent === sourceFile)
        changeChildOrderParentHandler.handleNode(sourceFile, replacementSourceFile);
    else {
        const parentFinderReplacement = new ParentFinderReplacementNodeHandler(compilerFactory, changeChildOrderParentHandler, changingParent);
        parentFinderReplacement.handleNode(sourceFile, replacementSourceFile);
    }
}
