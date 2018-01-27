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
import {ClassDeclaration, MethodDeclaration, MethodDeclarationStructure, MethodSignature, MethodSignatureStructure, JSDocStructure,
    ParameterDeclarationStructure, SourceFile, InterfaceDeclaration, TypeGuards} from "./../src/main";
import {getDefinitionAst, hasDescendantNodeType} from "./common";
import {InspectorFactory} from "./inspectors";

// setup
const factory = new InspectorFactory();
const inspector = factory.getTsSimpleAstInspector();

console.log("Start: " + new Date());
const ast = getDefinitionAst();
const compilerSourceFile = ast.getSourceFileOrThrow("compiler/index.d.ts");
const nodeToWrapperMappings = inspector.getNodeToWrapperMappings();

modifyFile(ast.getSourceFileOrThrow("Node.d.ts"));
modifyFile(ast.getSourceFileOrThrow("InitializerGetExpressionableNode.d.ts"));

console.log("End: " + new Date());

function modifyFile(sourceFile: SourceFile) {
    console.log("Adding compiler import...");
    sourceFile.addImportDeclaration({
        namespaceImport: "compiler",
        moduleSpecifier: sourceFile.getRelativePathToSourceFileAsModuleSpecifier(compilerSourceFile)
    });

    for (const classDec of sourceFile.getClasses())
        setClassSyntaxKindOverloads(classDec);

    for (const interfaceDec of sourceFile.getInterfaces())
        setInterfaceSyntaxKindOverloads(interfaceDec);

    const diagnostics = sourceFile.getDiagnostics();
    if (diagnostics.length > 0)
        throw new Error("There were definition file errors after adding the syntax kind overloads: " + diagnostics[0].getMessageText());

    sourceFile.saveSync();
}

function setClassSyntaxKindOverloads(classDec: ClassDeclaration) {
    // todo: merge this with setInterfaceSyntaxKindOverloads (just need to separate out common parts)
    const syntaxKindMethods: MethodDeclaration[] = [];

    ast.forgetNodesCreatedInBlock(remember => {
        const methods = classDec.getInstanceMethods().filter(m => m.getParameters().some(p => p.getType().getText() === "ts.SyntaxKind"));
        remember(...methods);
        syntaxKindMethods.push(...methods);
    });

    for (const method of syntaxKindMethods) {
        console.log("Modifying method: " + method.getName() + "...");
        ast.forgetNodesCreatedInBlock(() => {
            classDec.insertMethods(method.getChildIndex(), getMethodStructures(method));
        });
        method.forget();
    }
}

function setInterfaceSyntaxKindOverloads(interfaceDec: InterfaceDeclaration) {
    const syntaxKindMethods: MethodSignature[] = [];

    ast.forgetNodesCreatedInBlock(remember => {
        const methods = interfaceDec.getMethods().filter(m => m.getParameters().some(p => p.getType().getText() === "ts.SyntaxKind"));
        remember(...methods);
        syntaxKindMethods.push(...methods);
    });

    for (const method of syntaxKindMethods) {
        console.log("Modifying method: " + method.getName() + "...");
        ast.forgetNodesCreatedInBlock(() => {
            interfaceDec.insertMethods(method.getChildIndex(), getMethodStructures(method));
        });
        method.forget();
    }
}

function getMethodStructures(method: MethodDeclaration | MethodSignature) {
    const returnType = method.getReturnType();
    const isArrayType = returnType.isArrayType();
    const isNullableType = method.getReturnType().isUnionType();
    const docs: JSDocStructure[] = method.getJsDocs().map(n => ({ description: n.getInnerText() }));
    const structures: { name: string; returnType: string; parameters: ParameterDeclarationStructure[]; docs: JSDocStructure[] }[] = [];
    const nodeReturnType = isArrayType ? returnType.getArrayType()! : (isNullableType ? returnType.getUnionTypes().find(t => hasDescendantNodeType(t))! : returnType);
    const nodeReturnTypeDeclaration = nodeReturnType.getSymbolOrThrow().getDeclarations()[0];
    if (nodeReturnTypeDeclaration == null || !TypeGuards.isClassDeclaration(nodeReturnTypeDeclaration))
        throw new Error("Expected the return type to be a class.");

    for (const nodeToWrapper of nodeToWrapperMappings) {
        if (nodeToWrapper.wrapperName === "Node" || !nodeToWrapper.wrappedNode.getBases().some(b => b.getName() === nodeReturnTypeDeclaration.getName()))
            continue;

        for (const syntaxKindName of nodeToWrapper.syntaxKindNames) {
            const typeText = `ts.SyntaxKind.${syntaxKindName}`;

            const methodStructure = {
                name: method.getName(),
                parameters: [] as ParameterDeclarationStructure[],
                returnType: "compiler." + nodeToWrapper.wrapperName + (isArrayType ? "[]" : "") + (isNullableType ? " | undefined" : ""),
                docs
            };

            for (const param of method.getParameters()) {
                const name = param.getName()!;
                const type = param.getTypeNodeOrThrow().getText();
                methodStructure.parameters.push({
                    name,
                    type: type === "ts.SyntaxKind" ? `ts.SyntaxKind.${syntaxKindName}` : type
                });
            }
            structures.push(methodStructure);
        }
    }
    return structures;
}
