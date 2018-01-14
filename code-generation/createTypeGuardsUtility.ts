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
import * as ts from "typescript";
import CodeBlockWriter from "code-block-writer";
import TsSimpleAst, {ClassDeclaration, MethodDeclaration, MethodDeclarationStructure, Scope} from "./../src/main";
import {ArrayUtils, KeyValueCache} from "./../src/utils";
import {NodeToWrapperViewModel, ClassViewModel, MixinableViewModel, MixinViewModel} from "./view-models";

interface MethodInfo {
    name: string;
    wrapperName: string;
    syntaxKinds: string[];
    isMixin: boolean;
}

export function createTypeGuardsUtility(ast: TsSimpleAst, classVMs: ClassViewModel[], nodeToWrapperVMs: NodeToWrapperViewModel[]) {
    const file = ast.getSourceFileOrThrow("utils/TypeGuards.ts");
    const typeGuardsClass = file.getClass("TypeGuards");

    if (typeGuardsClass != null)
        typeGuardsClass.remove();

    file.addClass({
        name: "TypeGuards",
        isExported: true,
        ctor: { scope: Scope.Private },
        docs: [{
            description: "Type guards for checking the type of a node."
        }],
        methods: [...getMethodInfos().map(method => ({
            name: `is${method.name}`,
            isStatic: true,
            docs: [{
                description: `Gets if the node is ${(method.name[0] === "A" || method.name[0] === "E") ? "an" : "a"} ${method.name}.\r\n` +
                    "@param node - Node to check."
            }],
            parameters: [{ name: "node", type: "compiler.Node" }],
            returnType: `node is compiler.${method.wrapperName}` + (method.isMixin ? " & compiler.Node" : ""),
            bodyText: (writer: CodeBlockWriter) => writer.write("switch (node.getKind())").block(() => {
                    for (const syntaxKindName of method.syntaxKinds) {
                        writer.writeLine(`case ts.SyntaxKind.${syntaxKindName}:`);
                    }
                    writer.indent().write("return true;").newLine();
                    writer.writeLine("default:")
                        .indent().write("return false;").newLine();
                })
        })), getHasExpressionTypeGuard()]
    });

    file.save();

    function getMethodInfos() {
        const methodInfos = new KeyValueCache<string, MethodInfo>();

        for (const classVM of classVMs.filter(c => c.name !== "Node" && c.isNodeClass && isAllowedClass(c))) {
            const methodInfo = getMethodInfoForClass(classVM);
            if (classVM.base != null)
                fillBase(classVM, classVM.base);
            fillMixinable(classVM, classVM);
        }

        for (const nodeToWrapperVM of nodeToWrapperVMs.filter(v => v.wrapperName === "Node")) {
            for (const syntaxKindName of nodeToWrapperVM.syntaxKindNames) {
                methodInfos.set(syntaxKindName, {
                    name: syntaxKindName,
                    wrapperName: "Node",
                    syntaxKinds: [syntaxKindName],
                    isMixin: false
                });
            }
        }

        return ArrayUtils.from(methodInfos.getValues());

        function fillBase(classVM: ClassViewModel, baseVM: ClassViewModel) {
            if (baseVM.base != null)
                fillBase(classVM, baseVM.base);
            const methodInfo = getMethodInfoForClass(baseVM);
            methodInfo.syntaxKinds.push(...getSyntaxKindsForName(classVM.name));
            fillMixinable(classVM, baseVM);
        }

        function fillMixinable(classVM: ClassViewModel, mixinable: MixinableViewModel) {
            for (const mixin of mixinable.mixins) {
                getMethodInfoForMixin(mixin).syntaxKinds.push(...getSyntaxKindsForName(classVM.name));
                fillMixinable(classVM, mixin);
            }
        }

        function getMethodInfoForClass(classVM: ClassViewModel) {
            if (methodInfos.has(classVM.name))
                return methodInfos.get(classVM.name)!;
            const methodInfo: MethodInfo = {
                name: classVM.name,
                wrapperName: classVM.name,
                syntaxKinds: [...getSyntaxKindsForName(classVM.name)],
                isMixin: false
            };
            methodInfos.set(classVM.name, methodInfo);
            return methodInfo;
        }

        function getMethodInfoForMixin(mixin: MixinViewModel) {
            if (methodInfos.has(mixin.name))
                return methodInfos.get(mixin.name)!;
            const methodInfo: MethodInfo = {
                name: mixin.name,
                wrapperName: mixin.name,
                syntaxKinds: [],
                isMixin: true
            };
            methodInfos.set(mixin.name, methodInfo);
            return methodInfo;
        }

        function getSyntaxKindsForName(name: string) {
            const nodeToWrapperVM = ArrayUtils.find(nodeToWrapperVMs, n => n.wrapperName === name);
            if (nodeToWrapperVM == null)
                return [] as string[];
            return nodeToWrapperVM.syntaxKindNames;
        }
    }

    function getHasExpressionTypeGuard(): MethodDeclarationStructure {
        return {
            docs: [{ description: "Gets if the node has an expression.\r\n@param node - Node to check." }],
            isStatic: true,
            name: "hasExpression",
            returnType: "node is compiler.Node & { getExpression(): compiler.Expression; }",
            parameters: [{ name: "node", type: "compiler.Node" }],
            bodyText: writer => {
                writer.writeLine("if ((node as any).getExpression == null)");
                writer.indent().write("return false;");
                writer.writeLine("return (node as any).getExpression() != null;");
            }
        };
    }
}

function isAllowedClass(classVM: ClassViewModel) {
    switch (classVM.name) {
        // todo: should support these classes eventually (they probably need to be customly implemented)
        case "ObjectDestructuringAssignment":
        case "ArrayDestructuringAssignment":
        case "AssignmentExpression":
        case "SuperElementAccessExpression":
        case "SuperPropertyAccessExpression":
            return false;
        default:
            return true;
    }
}
