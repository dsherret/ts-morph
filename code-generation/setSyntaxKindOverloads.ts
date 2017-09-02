import TsSimpleAst, {MethodDeclaration, MethodDeclarationOverloadStructure} from "./../src/main";
import {NodeToWrapperViewModel} from "./view-models";

// this file sets the overloads of methods that take a syntax kind and return a wrapped node

export function setSyntaxKindOverloads(ast: TsSimpleAst, nodeToWrappers: NodeToWrapperViewModel[]) {
    const sourceFile = ast.getSourceFile("Node.ts")!;
    const nodeClass = sourceFile.getClass("Node")!;
    const syntaxKindMethods = nodeClass.getInstanceMethods().filter(m => m.getName() === "getChildrenOfKind" && m.getParameters().length === 1 && m.getParameters()[0].getType().getText() === "ts.SyntaxKind");

    for (const method of syntaxKindMethods) {
        console.log("Doing method: " + method.getName());
        changeMethod(method, nodeToWrappers);
        break;
    }
    console.log(nodeClass.getFullText());
}

function changeMethod(method: MethodDeclaration, nodeToWrappers: NodeToWrapperViewModel[]) {
    const isArrayType = method.getReturnType().isArrayType();
    const doc = method.getDocumentationComment()! + "\n" + "@param kind - Syntax kind.";
    const structures: MethodDeclarationOverloadStructure[] = [];
    for (const nodeToWrapper of nodeToWrappers) {
        structures.push({
            parameters: [{ name: "kind", type: `ts.SyntaxKind.${nodeToWrapper.syntaxKindName}` }],
            returnType: "ambientCompiler." + nodeToWrapper.wrapperName + (isArrayType ? "[]" : ""),
            docs: [{
                description: doc
            }]
        });
    }

    structures.push({
        parameters: [{ name: "kind", type: "ts.SyntaxKind" }],
        returnType: "Node" + (isArrayType ? "[]" : ""),
        docs: [{
            description: doc
        }]
    });

    method.addOverloads(structures);
}
