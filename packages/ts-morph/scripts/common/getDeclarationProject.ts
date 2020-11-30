import { createDeclarationProject as scriptsCreateDeclarationProject, tsMorph } from "@ts-morph/scripts";
import * as path from "path";
import { rootFolder } from "../config";

export function getDeclarationProject() {
    const project = new tsMorph.Project({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        manipulationSettings: {
            newLineKind: tsMorph.NewLineKind.LineFeed,
        },
        skipAddingFilesFromTsConfig: true,
    });
    project.addSourceFilesAtPaths(path.join(rootFolder, "lib/**/*.d.ts"));
    return project;
}

export function createDeclarationProject() {
    return scriptsCreateDeclarationProject({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.declarations.json"),
    });
}
