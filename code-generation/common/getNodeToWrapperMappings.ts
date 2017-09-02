import * as ts from "typescript";
import {NodeToWrapperViewModel} from "./../view-models";
import TsSimpleAst, {ClassDeclaration, Node} from "./../../src/main";

export function* getNodeToWrapperMappings(ast: TsSimpleAst): IterableIterator<NodeToWrapperViewModel> {
    const sourceFile = ast.getSourceFile("nodeToWrapperMappings.ts")!;
    const nodeToWrapperMappings = sourceFile.getVariableDeclaration("nodeToWrapperMappings")!;
    const initializer = nodeToWrapperMappings.getInitializer()!;
    const propertyAssignments = initializer.getDescendants().filter(d => d.getKind() === ts.SyntaxKind.PropertyAssignment) as Node<ts.PropertyAssignment>[];

    for (const assignment of propertyAssignments) {
        const nodeToWrapperVm: NodeToWrapperViewModel = {
            syntaxKindName: getSyntaxKindName(assignment),
            wrapperName: assignment.getNodeProperty("initializer").getText()
        };

        yield nodeToWrapperVm;
    }

    function getSyntaxKindName(assignment: Node<ts.PropertyAssignment>) {
        const computedPropertyName = assignment.getNodeProperty("name") as Node<ts.ComputedPropertyName>;
        const propAccessExpr = computedPropertyName.getNodeProperty("expression") as Node<ts.PropertyAccessExpression>;
        return propAccessExpr.getNodeProperty("name").getText();
    }
}
