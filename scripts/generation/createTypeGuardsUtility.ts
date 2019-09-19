/**
 * Code generation: Create TypeGuards Utility
 * ------------------------------------------
 * This code creates the TypeGurads class found in the utils folder.
 *
 * It is far easier to have this created and maintained by code generation.
 *
 * Benefits:
 * 1. Lowers the chance of a mistake in maintenance.
 * 2. Generated code doesn't require unit tests because it's very low risk for being wrong.
 * 3. Forward support: Features we add in the future will be auto-implemented.
 * ------------------------------------------
 */
import { CodeBlockWriter, MethodDeclarationStructure, PropertyDeclarationStructure, StructureKind, OptionalKind } from "ts-morph";
import { ArrayUtils, KeyValueCache } from "../../src/utils";
import { Mixin, TsMorphInspector, WrappedNode } from "../inspectors";

interface MethodInfo {
    name: string;
    wrapperName: string;
    syntaxKinds: string[];
    isMixin: boolean;
}

export function createTypeGuardsUtility(inspector: TsMorphInspector) {
    const file = inspector.getProject().getSourceFileOrThrow("./src/utils/TypeGuards.ts");
    const typeGuardsClass = file.getClassOrThrow("TypeGuards");
    const kindToWrapperMappings = inspector.getKindToWrapperMappings();
    const implementedNodeNames = inspector.getImplementedKindToNodeMappingsNames();

    // remove all the static methods/properties that start with "is"
    [...typeGuardsClass.getStaticMethods(), ...typeGuardsClass.getStaticProperties()]
        .filter(m => m.getName().startsWith("is"))
        .forEach(m => m.remove());

    createIs();
    createIsNode();
    createIsCommentMethods();

    const methodsAndProperties: Array<MethodDeclarationStructure | PropertyDeclarationStructure> = [];
    getMethodInfos().filter(n => isAllowedClass(n.name.replace(/^is/, ""))).forEach(method => {
        const description = `Gets if the node is ${(method.name[0] === "A" || method.name[0] === "E") ? "an" : "a"} ${method.name}.`;
        const common = {
            name: `is${method.name}`,
            isStatic: true
        };
        const isImplementedNodeName = implementedNodeNames.has(method.name);
        const hasSingleSyntaxKind = method.syntaxKinds.length == 1;
        if (isImplementedNodeName && !method.isMixin && hasSingleSyntaxKind) {
            const propertyStructure: PropertyDeclarationStructure = {
                ...common,
                kind: StructureKind.Property,
                docs: [{ description }],
                initializer: `TypeGuards.is(SyntaxKind.${method.name})`
            };
            methodsAndProperties.push(propertyStructure);
        }
        else {
            const methodStructure: MethodDeclarationStructure = {
                ...common,
                kind: StructureKind.Method,
                docs: [{
                    description: description + "\r\n@param node - Node to check."
                }],
                typeParameters: method.isMixin ? [{ name: "T", constraint: "compiler.Node" }] : [],
                parameters: [{ name: "node", type: method.isMixin ? "T" : "compiler.Node" }],
                returnType: `node is compiler.${method.wrapperName}` + (method.isMixin ? ` & compiler.${method.name}ExtensionType & T` : ""),
                statements: [writer => {
                    if (method.syntaxKinds.length === 0)
                        throw new Error(`For some reason ${method.name} had no syntax kinds.`);

                    writeSyntaxKinds(writer, method.syntaxKinds);
                }]
            };
            methodsAndProperties.push(methodStructure);
        }
    });

    for (const methodOrProp of methodsAndProperties) {
        if (methodOrProp.kind == StructureKind.Method)
            typeGuardsClass.addMethod(methodOrProp);
        else if (methodOrProp.kind == StructureKind.Property)
            typeGuardsClass.addProperty(methodOrProp);
        else
            throw new Error(`Expected only properties and methods.`);
    }
    typeGuardsClass.forgetDescendants();
    updateHasStructure();

    function getMethodInfos() {
        const methodInfos = new KeyValueCache<string, MethodInfo>();

        for (const node of inspector.getWrappedNodes()) {
            // todo: what is going on here? Why does this need to be filled
            getMethodInfoForNode(node); // fill this
            const nodeBase = node.getBase();
            if (nodeBase != null)
                fillBase(node, nodeBase);
            fillMixinable(node, node);
        }

        const allowedBaseNames = ["Node", "Expression", "BooleanLiteral"];
        for (const kindToWrapperMapping of kindToWrapperMappings.filter(v => allowedBaseNames.indexOf(v.wrapperName) >= 0)) {
            for (const syntaxKindName of kindToWrapperMapping.syntaxKindNames) {
                methodInfos.set(syntaxKindName, {
                    name: syntaxKindName,
                    wrapperName: kindToWrapperMapping.wrapperName,
                    syntaxKinds: [syntaxKindName],
                    isMixin: false
                });
            }
        }

        return ArrayUtils.sortByProperty(methodInfos.getValuesAsArray(), info => info.name);

        function fillBase(node: WrappedNode, nodeBase: WrappedNode) {
            if (!isAllowedName(nodeBase.getName()))
                return;
            const nodeBaseBase = nodeBase.getBase();
            if (nodeBaseBase != null)
                fillBase(node, nodeBaseBase);
            const methodInfo = getMethodInfoForNode(nodeBase);
            methodInfo.syntaxKinds.push(...getSyntaxKindsForName(node.getName()));
            fillMixinable(node, nodeBase);
        }

        function fillMixinable(node: WrappedNode, mixinable: WrappedNode | Mixin) {
            for (const mixin of mixinable.getMixins()) {
                if (!isAllowedName(mixin.getName()))
                    continue;
                getMethodInfoForMixin(mixin).syntaxKinds.push(...getSyntaxKindsForName(node.getName()));
                fillMixinable(node, mixin);
            }
        }

        function getMethodInfoForNode(node: WrappedNode) {
            const nodeName = node.getName();
            if (methodInfos.has(nodeName))
                return methodInfos.get(nodeName)!;
            const methodInfo: MethodInfo = {
                name: nodeName,
                wrapperName: nodeName,
                syntaxKinds: [...getSyntaxKindsForName(nodeName)],
                isMixin: false
            };
            methodInfos.set(nodeName, methodInfo);
            return methodInfo;
        }

        function getMethodInfoForMixin(mixin: Mixin) {
            const mixinName = mixin.getName();
            if (methodInfos.has(mixinName))
                return methodInfos.get(mixinName)!;
            const methodInfo: MethodInfo = {
                name: mixinName,
                wrapperName: mixinName,
                syntaxKinds: [],
                isMixin: true
            };
            methodInfos.set(mixinName, methodInfo);
            return methodInfo;
        }

        function getSyntaxKindsForName(name: string) {
            const kindToWrapperVM = kindToWrapperMappings.find(n => n.wrapperName === name);
            if (kindToWrapperVM == null)
                return [] as string[];
            return kindToWrapperVM.syntaxKindNames;
        }
    }

    function updateHasStructure() {
        const hasStructureMethod = typeGuardsClass.getStaticMethod("_hasStructure");
        if (hasStructureMethod != null)
            hasStructureMethod.remove();

        const nodesWithGetStructure = inspector.getWrappedNodes().filter(n => n.hasMethod("getStructure"));
        typeGuardsClass.addMethod({
            docs: ["@internal"],
            isStatic: true,
            name: "_hasStructure",
            parameters: [{ name: "node", type: "compiler.Node" }],
            returnType: `node is compiler.Node & { getStructure(): Structure; }`,
            statements: [writer => {
                writeSyntaxKinds(writer, nodesWithGetStructure.map(n => kindToWrapperMappings.find(m => m.wrapperName === n.getName())!.syntaxKindNames[0]));
            }]
        });
    }

    // todo: remove these from the code generation and instead add some kind of tag to them
    // so they aren't deleted (maybe in the function body as a comment)

    function createIs() {
        typeGuardsClass.addMethod({
            docs: [`Creates a type guard for syntax kinds.`],
            isStatic: true,
            name: "is",
            typeParameters: [
                { name: `TKind`, constraint: `keyof ImplementedKindToNodeMappings` }
            ],
            parameters: [{ name: `kind`, type: `TKind` }],
            returnType: `(node: compiler.Node) => node is ImplementedKindToNodeMappings[TKind]`,
            statements: [
                writer => writer
                    .writeLine(`return (node: compiler.Node): node is ImplementedKindToNodeMappings[TKind] => {`)
                    .indent(() => {
                        writer.writeLine(`return node.getKind() == kind`);
                    })
                    .writeLine(`}`)
            ]
        });
    }

    function createIsNode() {
        typeGuardsClass.addMethod({
            docs: ["Gets if the provided value is a Node."],
            isStatic: true,
            name: "isNode",
            returnType: `value is compiler.Node`,
            parameters: [{ name: "value", type: "unknown" }],
            statements: [writer => {
                writer.writeLine("return value != null && (value as any).compilerNode != null");
            }]
        });
    }

    function createIsCommentMethods() {
        const commentMethods: OptionalKind<MethodDeclarationStructure>[] = [{
            docs: ["Gets if the provided node is a CommentStatement."],
            isStatic: true,
            name: "isCommentStatement",
            returnType: `node is compiler.CommentStatement`,
            parameters: [{ name: "node", type: "compiler.Node" }],
            statements: [writer => {
                writer.writeLine(`return (node.compilerNode as compiler.CompilerCommentStatement)._commentKind === compiler.CommentNodeKind.Statement;`);
            }]
        }, {
            docs: ["Gets if the provided node is a CommentClassElement."],
            isStatic: true,
            name: "isCommentClassElement",
            returnType: `node is compiler.CommentClassElement`,
            parameters: [{ name: "node", type: "compiler.Node" }],
            statements: [writer => {
                writer.writeLine(`return (node.compilerNode as compiler.CompilerCommentClassElement)._commentKind === compiler.CommentNodeKind.ClassElement;`);
            }]
        }, {
            docs: ["Gets if the provided value is a CommentTypeElement."],
            isStatic: true,
            name: "isCommentTypeElement",
            returnType: `node is compiler.CommentTypeElement`,
            parameters: [{ name: "node", type: "compiler.Node" }],
            statements: [writer => {
                writer.writeLine(`return (node.compilerNode as compiler.CompilerCommentTypeElement)._commentKind === compiler.CommentNodeKind.TypeElement;`);
            }]
        }, {
            docs: ["Gets if the provided node is a CommentObjectLiteralElement."],
            isStatic: true,
            name: "isCommentObjectLiteralElement",
            returnType: `node is compiler.CommentObjectLiteralElement`,
            parameters: [{ name: "node", type: "compiler.Node" }],
            statements: [writer => {
                writer.writeLine(
                    `return (node.compilerNode as compiler.CompilerCommentObjectLiteralElement)._commentKind === compiler.CommentNodeKind.ObjectLiteralElement;`
                );
            }]
        }, {
            docs: ["Gets if the provided node is a CommentEnumMember."],
            isStatic: true,
            name: "isCommentEnumMember",
            returnType: `node is compiler.CommentEnumMember`,
            parameters: [{ name: "node", type: "compiler.Node" }],
            statements: [writer => {
                writer.writeLine(`return (node.compilerNode as compiler.CompilerCommentEnumMember)._commentKind == compiler.CommentNodeKind.EnumMember;`);
            }]
        }];

        typeGuardsClass.addMethods([{
            docs: ["Gets if the provided node is a comment node."],
            isStatic: true,
            name: "isCommentNode",
            returnType: `node is ${commentMethods.map(c => "compiler." + c.name.replace("is", "")).join(" | ")}`,
            parameters: [{ name: "node", type: "compiler.Node" }],
            statements: [writer => {
                writer.writeLine("const kind = node.getKind();");
                writer.writeLine(`return kind === SyntaxKind.SingleLineCommentTrivia || kind === SyntaxKind.MultiLineCommentTrivia;`);
            }]
        }, ...commentMethods]);
    }
}

function writeSyntaxKinds(writer: CodeBlockWriter, kinds: string[]) {
    if (kinds.length === 1) {
        writer.writeLine(`return node.getKind() === SyntaxKind.${kinds[0]};`);
        return;
    }

    writer.write("switch (node.getKind())").block(() => {
        for (const syntaxKindName of kinds)
            writer.writeLine(`case SyntaxKind.${syntaxKindName}:`);
        writer.indent().write("return true;").newLine();
        writer.writeLine("default:")
            .indent().write("return false;").newLine();
    });
}

function isAllowedName(name: string) {
    if (name === "Node" || name.endsWith("Specific") || name.endsWith("SpecificBase"))
        return false;
    return true;
}

function isAllowedClass(name: string) {
    switch (name) {
        case "Node":
        case "FunctionOrConstructorTypeNodeBase":
        case "CommentStatement":
        case "CommentClassElement":
        case "CommentTypeElement":
        case "CommentObjectLiteralElement":
        case "CommentEnumMember":
        // todo: should support these classes eventually (they probably need to be customly implemented)
        case "ObjectDestructuringAssignment":
        case "ArrayDestructuringAssignment":
        case "AssignmentExpression":
        case "SuperElementAccessExpression":
        case "SuperPropertyAccessExpression":
        case "SuperExpressionedNode":
        // ignore these for now because they're not implemented properly
        case "ClassElement":
        case "ObjectLiteralElement":
            return false;
        default:
            return true;
    }
}
