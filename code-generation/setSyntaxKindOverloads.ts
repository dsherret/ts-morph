import TsSimpleAst, {ClassDeclaration, MethodDeclaration, MethodDeclarationStructure} from "./../src/main";
import {NodeToWrapperViewModel} from "./view-models";
import {getAst, getDefinitionAst, getNodeToWrapperMappings} from "./common";

// this file sets the overloads of methods that take a syntax kind and return a wrapped node

const ast = getDefinitionAst();
setSyntaxKindOverloads(Array.from(getNodeToWrapperMappings(getAst())));

export function setSyntaxKindOverloads(nodeToWrappers: NodeToWrapperViewModel[]) {
    const sourceFile = ast.getSourceFileOrThrow("Node.d.ts");
    const nodeClass = sourceFile.getClass("Node")!;
    const syntaxKindMethods = nodeClass.getInstanceMethods().filter(m => m.getParameters().length === 1 && m.getParameters()[0].getType().getText() === "ts.SyntaxKind");

    console.log("Adding compiler import...");
    sourceFile.addImport({
        namespaceImport: "compiler",
        moduleSpecifier: "./../../compiler"
    });

    for (const method of syntaxKindMethods) {
        console.log("Modifying method: " + method.getName() + "...");
        addMethods(nodeClass, method, nodeToWrappers);
    }

    const diagnostics = sourceFile.getDiagnostics();
    if (diagnostics.length > 0)
        throw new Error("There were definition file errors after adding the syntax kind overloads: " + diagnostics[0].getMessageText());

    sourceFile.saveSync();
}

function addMethods(classDeclaration: ClassDeclaration, method: MethodDeclaration, nodeToWrappers: NodeToWrapperViewModel[]) {
    const isArrayType = method.getReturnType().isArrayType();
    const isNullableType = method.getReturnType().isUnionType();
    const doc = method.getDocumentationComment()! + "\n" + "@param kind - Syntax kind.";
    const structures: MethodDeclarationStructure[] = [];

    for (const nodeToWrapper of nodeToWrappers) {
        for (const syntaxKindName of nodeToWrapper.syntaxKindNames) {
            const typeText = `ts.SyntaxKind.${syntaxKindName}`;

            structures.push({
                name: method.getName(),
                parameters: [{ name: "kind", type: `ts.SyntaxKind.${syntaxKindName}` }],
                returnType: "compiler." + nodeToWrapper.wrapperName + (isArrayType ? "[]" : "") + (isNullableType ? " | undefined" : ""),
                docs: [{
                    description: doc
                }]
            });
        }
    }

    const methods = classDeclaration.insertMethods(method.getChildIndex(), structures);
    methods.forEach(m => m.forget()); // for performance reasons
}
