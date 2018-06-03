/**
 * Code Manipulation - Refactor
 * ----------------------------
 * Use this script as a strating point when refactoring the application.
 * Edit within the for..of loop.
 * ----------------------------
 */

import { InspectorFactory } from "./inspectors";
import { SyntaxKind, TypeGuards } from "ts-simple-ast";
import { ArrayUtils } from "../src/utils";

const factory = new InspectorFactory();
const tsaInspector = factory.getTsSimpleAstInspector();
const project = factory.getProject();
const directory = tsaInspector.getSrcDirectory();
const sourceFiles = directory.getDescendantSourceFiles();
const start = new Date();

for (let i = 0; i < sourceFiles.length; i++) {
    const sourceFile = sourceFiles[i];
    console.log(`[${i + 1}/${sourceFiles.length}] Updating: ${sourceFile.getFilePath()}`);
    /* DON'T CHECK IN THE CHANGES WITHIN THIS BLOCK */
    for (const method of ArrayUtils.flatten(sourceFile.getClasses().map(c => c.getInstanceMethods()))) {
        const body = method.getBody();
        if (body == null)
            continue;
        const returnStatement = body.getChildSyntaxList()!.getLastChildIfKind(SyntaxKind.ReturnStatement);
        if (returnStatement == null)
            continue;
        const expression = returnStatement.getExpression();
        if (expression == null || !TypeGuards.isCallExpression(expression))
            continue;
        if (expression.getExpression()!.getText() !== "this.getNodeFromCompilerNodeIfExists")
            continue;
        if (!method.getReturnType()!.isNullable())
            method.setReturnType(method.getReturnTypeNodeOrThrow().getText() + " | undefined");
    }
}

project.save();
const end = new Date().getTime() - start.getTime();
console.log(`FINISHED: ${end / 1000}s`);
