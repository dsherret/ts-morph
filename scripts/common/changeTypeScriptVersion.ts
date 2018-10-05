import { Project } from "ts-simple-ast";
import * as path from "path";
import { rootFolder } from "../config";

export function changeTypeScriptVersion(version: string) {
    setModuleSpecifierValue(`typescript-${version}`);
}

export function resetTypeScriptVersion() {
    setModuleSpecifierValue("typescript");
}

function setModuleSpecifierValue(value: string) {
    const project = new Project();
    const sourceFile = project.addExistingSourceFile(path.join(rootFolder, "src/typescript/public.ts"));
    for (const importDec of sourceFile.getImportDeclarations()) {
        const moduleSpecifierValue = importDec.getModuleSpecifierValue();
        if (moduleSpecifierValue.startsWith("typescript"))
            importDec.setModuleSpecifier(value);
    }

    sourceFile.saveSync();
}
