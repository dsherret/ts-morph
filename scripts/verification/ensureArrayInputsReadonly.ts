/**
 * Code Verification - Ensure Array Inputs Readonly
 * ------------------------------------------------
 * This code verification ensures the
 * ------------------------------------------------
 */
import { TypeGuards, SyntaxKind } from "ts-simple-ast";
import { InspectorFactory } from "../inspectors";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

// get info
const declarations = inspector.getPublicDeclarations();

// find problems
const problems: string[] = [];

for (const declaration of declarations) {
    // ignore typescript declarations
    if (declaration.getSourceFile().getFilePath().endsWith("src/typescript/typescript.ts"))
        continue;

    // could be improved, but good enough for now
    declaration.forEachDescendant((node, traversal) => {
        if (!TypeGuards.isArrayTypeNode(node))
            return;

        // ignore types not found in parameters, rest parameters, callbacks, and arrow functions
        const parameter = node.getFirstAncestorByKind(SyntaxKind.Parameter);
        const functionType = node.getFirstAncestorByKind(SyntaxKind.FunctionType);
        if (parameter == null || functionType != null || (node.getParent() === parameter && parameter.isRestParameter())
            || TypeGuards.isArrowFunction(parameter.getParent()))
            return;

        problems.push(`[${node.getSourceFile().getFilePath()}:${node.getStartLineNumber()}]: Found input array type (${node.getText()}).`);
    });
}

if (problems.length > 0) {
    console.log(problems);
    console.error("There were issues with array inputs!");
    process.exit(1);
}
