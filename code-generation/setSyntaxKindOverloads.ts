import TsSimpleAst, {ClassDeclaration, MethodDeclaration, MethodDeclarationStructure, JSDocStructure} from "./../src/main";
import {NodeToWrapperViewModel} from "./view-models";
import {getAst, getDefinitionAst, getNodeToWrapperMappings} from "./common";

// this file sets the overloads of methods that take a syntax kind and return a wrapped node

const ast = getDefinitionAst();
setSyntaxKindOverloads(Array.from(getNodeToWrapperMappings(getAst())));

export function setSyntaxKindOverloads(nodeToWrappers: NodeToWrapperViewModel[]) {
    const sourceFile = ast.getSourceFileOrThrow("Node.d.ts");
    const nodeClass = sourceFile.getClass("Node")!;
    const syntaxKindMethods: MethodDeclaration[] = [];

    ast.forgetNodesCreatedInBlock(remember => {
        const methods = nodeClass.getInstanceMethods().filter(m => m.getParameters().some(p => p.getType().getText() === "ts.SyntaxKind"));
        remember(...methods);
        syntaxKindMethods.push(...methods);
    });

    console.log("Adding compiler import...");
    sourceFile.addImport({
        namespaceImport: "compiler",
        moduleSpecifier: "./../../compiler"
    });

    for (const method of syntaxKindMethods) {
        console.log("Modifying method: " + method.getName() + "...");
        ast.forgetNodesCreatedInBlock(() => {
            addMethods(nodeClass, method, nodeToWrappers);
        });
        method.forget();
    }

    const diagnostics = sourceFile.getDiagnostics();
    if (diagnostics.length > 0)
        throw new Error("There were definition file errors after adding the syntax kind overloads: " + diagnostics[0].getMessageText());

    sourceFile.saveSync();
}

function addMethods(classDeclaration: ClassDeclaration, method: MethodDeclaration, nodeToWrappers: NodeToWrapperViewModel[]) {
    const isArrayType = method.getReturnType().isArrayType();
    const isNullableType = method.getReturnType().isUnionType();
    const docs: JSDocStructure[] = method.getDocNodes().map(n => ({ description: n.getInnerText() }));
    const structures: MethodDeclarationStructure[] = [];

    for (const nodeToWrapper of nodeToWrappers) {
        for (const syntaxKindName of nodeToWrapper.syntaxKindNames) {
            const typeText = `ts.SyntaxKind.${syntaxKindName}`;

            const methodStructure: MethodDeclarationStructure = {
                name: method.getName(),
                parameters: [],
                returnType: "compiler." + nodeToWrapper.wrapperName + (isArrayType ? "[]" : "") + (isNullableType ? " | undefined" : ""),
                docs
            };
            for (const param of method.getParameters()) {
                const name = param.getName()!;
                const type = param.getTypeNodeOrThrow().getText();
                methodStructure.parameters!.push({
                    name,
                    type: type === "ts.SyntaxKind" ? `ts.SyntaxKind.${syntaxKindName}` : type
                });
            }
            structures.push(methodStructure);
        }
    }

    classDeclaration.insertMethods(method.getChildIndex(), structures);
}
