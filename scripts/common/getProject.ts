import * as path from "path";
import Project, {NewLineKind} from "../../src/main";
import {rootFolder} from "../config";

export function getProject() {
    const project = new Project({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        addFilesFromTsConfig: false,
        manipulationSettings: {
            newLineKind: NewLineKind.CarriageReturnLineFeed
        }
    });
    project.addExistingSourceFiles(path.join(rootFolder, "src/**/*{.d.ts,.ts}"));
    project.addExistingSourceFile(path.join(rootFolder, "node_modules/typescript/lib/typescript.d.ts"));
    return project;
}
