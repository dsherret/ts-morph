import {SourceFile, RenameLocation} from "./../../compiler";
import {Logger} from "./../../utils";
import {NodeHandlerFactory} from "./../nodeHandlers";
import {RenameLocationTextManipulator} from "./../textManipulators";
import {doManipulation} from "./../doManipulation";

export function replaceSourceFileTextForRename(opts: { sourceFile: SourceFile; renameLocations: RenameLocation[]; newName: string; }) {
    const {sourceFile, renameLocations, newName} = opts;
    const nodeHandlerFactory = new NodeHandlerFactory();

    doManipulation(sourceFile,
        new RenameLocationTextManipulator(renameLocations, newName),
        nodeHandlerFactory.getForTryOrForget(nodeHandlerFactory.getForForgetChanged(sourceFile.global.compilerFactory)));
}
