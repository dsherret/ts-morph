import * as path from "path";
import { Project, NewLineKind } from "ts-morph";
import { rootFolder } from "../config";
import { printDiagnostics } from "./printDiagnostics";

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
    const project = new Project({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.declarations.json"),
        manipulationSettings: {
            newLineKind: NewLineKind.CarriageReturnLineFeed
        },
        addFilesFromTsConfig: true
    });

    const emitResult = project.emitToMemory({ emitOnlyDtsFiles: true });

    if (emitResult.getDiagnostics().length > 0) {
        printDiagnostics(emitResult.getDiagnostics());
        process.exit(1);
    }

    const declarationProject = new Project({
        tsConfigFilePath: path.join(rootFolder, "tsconfig.json"),
        manipulationSettings: {
            newLineKind: NewLineKind.CarriageReturnLineFeed
        },
        addFilesFromTsConfig: false
    });

    for (const file of emitResult.getFiles())
        declarationProject.createSourceFile(file.filePath, file.text, { overwrite: true });

    return declarationProject;
}
