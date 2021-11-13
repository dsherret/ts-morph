import { errors, KeyValueCache } from "@ts-morph/common";
import { replaceSourceFileTextForRename } from "../../../../manipulation";
import { RenameLocation, RenameOptions } from "../../../tools";
import { Node } from "../../common";
import { SourceFile } from "../../module";

export function renameNode(node: Node, newName: string, options?: RenameOptions) {
    errors.throwIfWhitespaceOrNotString(newName, "newName");

    if (node.getText() === newName)
        return;

    const renameLocations = node._context.languageService.findRenameLocations(node, options);
    const renameLocationsBySourceFile = new KeyValueCache<SourceFile, RenameLocation[]>();

    for (const renameLocation of renameLocations) {
        const locations = renameLocationsBySourceFile.getOrCreate<RenameLocation[]>(renameLocation.getSourceFile(), () => []);
        locations.push(renameLocation);
    }

    for (const [sourceFile, locations] of renameLocationsBySourceFile.getEntries()) {
        replaceSourceFileTextForRename({
            sourceFile,
            renameLocations: locations,
            newName,
        });
    }
}
