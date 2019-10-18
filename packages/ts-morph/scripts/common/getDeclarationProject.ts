import * as path from "path";
import { Project, NewLineKind } from "ts-morph";
import { createDeclarationProject as scriptsCreateDeclarationProject } from "@ts-morph/scripts";
import { rootFolder } from "../config";

export function getDeclarationProject() {
    const project = new Project({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        manipulationSettings: {
            newLineKind: NewLineKind.CarriageReturnLineFeed
        },
        addFilesFromTsConfig: false
    });
    project.addExistingSourceFiles(path.join(rootFolder, "dist-declarations/**/*.d.ts"));
    return project;
}

export function createDeclarationProject() {
    return scriptsCreateDeclarationProject({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.declarations.json")
    });
}
