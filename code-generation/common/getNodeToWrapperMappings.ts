import * as ts from "typescript";
import {NodeToWrapperViewModel} from "./../view-models";
import TsSimpleAst, {ClassDeclaration, Node, PropertyAccessExpression, PropertyAssignment, ComputedPropertyName} from "./../../src/main";

export function getNodeToWrapperMappings(ast: TsSimpleAst): NodeToWrapperViewModel[] {
    const sourceFile = ast.getSourceFileOrThrow("nodeToWrapperMappings.ts");
    const nodeToWrapperMappings = sourceFile.getVariableDeclaration("nodeToWrapperMappings")!;
    const initializer = nodeToWrapperMappings.getInitializer()!;
    const propertyAssignments = initializer.getDescendants().filter(d => d.getKind() === ts.SyntaxKind.PropertyAssignment) as PropertyAssignment[];
    const result: { [wrapperName: string]: NodeToWrapperViewModel; } = {};

    for (const assignment of propertyAssignments) {
        const wrapperName = (assignment.getInitializerOrThrow() as PropertyAccessExpression).getName();
        if (result[wrapperName] == null)
            result[wrapperName] = { wrapperName, syntaxKindNames: [] };

        result[wrapperName].syntaxKindNames.push(getSyntaxKindName(assignment));
    }

    return Object.keys(result).map(k => result[k]);

    function getSyntaxKindName(assignment: PropertyAssignment) {
        const computedPropertyName = assignment.getNameNode() as ComputedPropertyName;
        const propAccessExpr = computedPropertyName.getExpression() as PropertyAccessExpression;
        return propAccessExpr.getNameNode().getText();
    }
}
