/**
 * Code Manipulation - Flatten declaration files.
 * ----------------------------------------------
 * This modifies the declaration file for this library to create specific overloads for methods that take a syntax kind and return a wrapped node.
 *
 * For example the following method declaration in the definition file:
 *
 *     getFirstChildByKind(kind: ts.SyntaxKind): Node | undefined;
 *
 * Would cause a large amount of specific overloads to be added for each literal and the coresponding wrapped node so people don't need to bother casting:
 *
 *     getFirstChildByKind(kind: ts.SyntaxKind.ArrowFunction): ArrowFunction | undefined;
 *     getFirstChildByKind(kind: ts.SyntaxKind.AsExpression): AsExpression | undefined;
 *     // ...repeat with all the wrapped nodes...
 *     getFirstChildByKind(kind: ts.SyntaxKind): Node | undefined;
 *
 * ----------------------------------------------
 */
import {ClassDeclaration, MethodDeclaration, MethodDeclarationStructure, JSDocStructure} from "./../src/main";
import {getDefinitionAst} from "./common";
import {InspectorFactory} from "./inspectors";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

console.log("Start: " + new Date());
const ast = getDefinitionAst();
const nodeToWrapperMappings = inspector.getNodeToWrapperMappings();
setSyntaxKindOverloads();
console.log("End: " + new Date());

export function setSyntaxKindOverloads() {
    const sourceFile = ast.getSourceFileOrThrow("Node.d.ts");
    const nodeClass = sourceFile.getClass("Node")!;
    const syntaxKindMethods: MethodDeclaration[] = [];

    ast.forgetNodesCreatedInBlock(remember => {
        const methods = nodeClass.getInstanceMethods().filter(m => m.getParameters().some(p => p.getType().getText() === "ts.SyntaxKind"));
        remember(...methods);
        syntaxKindMethods.push(...methods);
    });

    console.log("Adding compiler import...");
    sourceFile.addImportDeclaration({
        namespaceImport: "compiler",
        moduleSpecifier: "./../../compiler"
    });

    for (const method of syntaxKindMethods) {
        console.log("Modifying method: " + method.getName() + "...");
        ast.forgetNodesCreatedInBlock(() => {
            addMethods(nodeClass, method);
        });
        method.forget();
    }

    const diagnostics = sourceFile.getDiagnostics();
    if (diagnostics.length > 0)
        throw new Error("There were definition file errors after adding the syntax kind overloads: " + diagnostics[0].getMessageText());

    sourceFile.saveSync();
}

function addMethods(classDeclaration: ClassDeclaration, method: MethodDeclaration) {
    const isArrayType = method.getReturnType().isArrayType();
    const isNullableType = method.getReturnType().isUnionType();
    const docs: JSDocStructure[] = method.getJsDocs().map(n => ({ description: n.getInnerText() }));
    const structures: MethodDeclarationStructure[] = [];

    for (const nodeToWrapper of nodeToWrapperMappings) {
        if (nodeToWrapper.wrapperName === "Node")
            continue;

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
