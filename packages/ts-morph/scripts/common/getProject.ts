import { tsMorph } from "@ts-morph/scripts";
import * as path from "path";
import { rootFolder } from "../config";

export function getProject() {
    const project = new tsMorph.Project({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        skipAddingFilesFromTsConfig: true,
        manipulationSettings: {
            newLineKind: tsMorph.NewLineKind.LineFeed,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
        },
    });
    project.addSourceFilesAtPaths(path.join(rootFolder, "src/**/*{.d.ts,.ts}"));
    project.addSourceFileAtPath(path.join(rootFolder, "node_modules/typescript/lib/typescript.d.ts"));
    return project;
}
