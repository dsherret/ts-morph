import { Project, SyntaxKind, StringLiteral } from "ts-morph";
import * as path from "path";

export function changeTypeScriptVersion(version: string) {
    setModuleSpecifierValue(`typescript-${version}`);
}

export function resetTypeScriptVersion() {
    setModuleSpecifierValue("typescript");
}

function setModuleSpecifierValue(value: string) {
    const project = new Project();
    const declarationFile = project.addSourceFileAtPath(path.join(__dirname, "../../common/lib/ts-morph-common.d.ts"));
    const jsFile = project.addSourceFileAtPath(path.join(__dirname, "../../common/dist/ts-morph-common.js"));

    for (const importDec of declarationFile.getImportDeclarations()) {
        const moduleSpecifierValue = importDec.getModuleSpecifierValue();
        if (moduleSpecifierValue.startsWith("typescript"))
            importDec.setModuleSpecifier(value);
    }

    const callExpr = jsFile.getVariableDeclarationOrThrow("ts").getInitializerIfKindOrThrow(SyntaxKind.CallExpression);
    (callExpr.getArguments()[0] as StringLiteral).setLiteralValue(value);

    [declarationFile, jsFile].forEach(s => s.saveSync());
}
