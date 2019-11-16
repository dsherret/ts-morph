import * as path from "path";
import { createDeclarationProject as scriptsCreateDeclarationProject, tsMorph } from "@ts-morph/scripts";
import { rootFolder } from "../config";

export function getDeclarationProject() {
    const project = new tsMorph.Project({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        manipulationSettings: {
            newLineKind: tsMorph.NewLineKind.CarriageReturnLineFeed
        },
        addFilesFromTsConfig: false
    });
    project.addSourceFilesAtPaths(path.join(rootFolder, "dist-declarations/**/*.d.ts"));
    return project;
}

export function createDeclarationProject() {
    return scriptsCreateDeclarationProject({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.declarations.json")
    });
}
