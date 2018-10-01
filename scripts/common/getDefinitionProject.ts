import * as path from "path";
import { Project, NewLineKind } from "ts-simple-ast";
import { rootFolder } from "../config";

export function getDefinitionProject() {
    const project = new Project({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        manipulationSettings: {
            newLineKind: NewLineKind.CarriageReturnLineFeed
        },
        addFilesFromTsConfig: false
    });
    project.addExistingSourceFiles(path.join(rootFolder, "dist/**/*.d.ts"));
    return project;
}
