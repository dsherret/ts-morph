import * as path from "path";
import { Project, NewLineKind } from "ts-morph";
import { rootFolder } from "../config";

export function getProject() {
    const project = new Project({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        addFilesFromTsConfig: false,
        manipulationSettings: {
            newLineKind: NewLineKind.CarriageReturnLineFeed,
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true
        }
    });
    project.addSourceFilesAtPaths(path.join(rootFolder, "src/**/*{.d.ts,.ts}"));
    project.addSourceFileAtPath(path.join(rootFolder, "node_modules/typescript/lib/typescript.d.ts"));
    return project;
}
