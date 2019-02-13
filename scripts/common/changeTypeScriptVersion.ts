import { Project } from "ts-morph";
import * as path from "path";
import { rootFolder } from "../config";
import { ArrayUtils } from "../../src/utils/ArrayUtils";

export function changeTypeScriptVersion(version: string) {
    setModuleSpecifierValue(`typescript-${version}`);
}

export function resetTypeScriptVersion() {
    setModuleSpecifierValue("typescript");
}

function setModuleSpecifierValue(value: string) {
    const project = new Project();
    const sourceFiles = [
        project.addExistingSourceFile(path.join(rootFolder, "dist-declarations/ts-morph.d.ts")),
        project.addExistingSourceFile(path.join(rootFolder, "src/typescript/public.ts"))
    ];

    for (const importDec of ArrayUtils.flatten(sourceFiles.map(s => s.getImportDeclarations()))) {
        const moduleSpecifierValue = importDec.getModuleSpecifierValue();
        if (moduleSpecifierValue.startsWith("typescript"))
            importDec.setModuleSpecifier(value);
    }

    sourceFiles.forEach(s => s.saveSync());
}
