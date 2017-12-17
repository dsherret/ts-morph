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
import {ArrayUtils} from "./../src/utils";
import {NodeToWrapperViewModel, ClassViewModel, MixinableViewModel} from "./view-models";

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
        methods: getMethodInfos().map(method => ({
            name: `is${method.name}`,
            isStatic: true,
            docs: [{
                description: `Gets if the node is ${method.name[0] === "A" ? "an" : "a"} ${method.name}.\r\n` +
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
        }))
    });

    file.save();

    function getMethodInfos() {
        const methodInfos: { [name: string]: MethodInfo; } = {};

        for (const classVM of classVMs.filter(c => c.name !== "Node" && nodeToWrapperVMs.some(vm => vm.wrapperName === c.name))) {
            methodInfos[classVM.name] = {
                name: classVM.name,
                wrapperName: classVM.name,
                syntaxKinds: [...getSyntaxKindsForName(classVM.name)],
                isMixin: false
            };

            fillMixinable(classVM, classVM);
        }

        for (const nodeToWrapperVM of nodeToWrapperVMs.filter(v => v.wrapperName === "Node")) {
            for (const syntaxKindName of nodeToWrapperVM.syntaxKindNames) {
                methodInfos[syntaxKindName] = {
                    name: syntaxKindName,
                    wrapperName: "Node",
                    syntaxKinds: [syntaxKindName],
                    isMixin: false
                };
            }
        }

        return Object.keys(methodInfos).sort().map(k => methodInfos[k]);

        function fillMixinable(classVM: ClassViewModel, mixinable: MixinableViewModel) {
            for (const mixin of mixinable.mixins) {
                if (methodInfos[mixin.name] == null) {
                    methodInfos[mixin.name] = {
                        name: mixin.name,
                        wrapperName: mixin.name,
                        syntaxKinds: [],
                        isMixin: true
                    };
                }
                methodInfos[mixin.name].syntaxKinds.push(...getSyntaxKindsForName(classVM.name));
                fillMixinable(classVM, mixin);
            }
        }

        function getSyntaxKindsForName(name: string) {
            const nodeToWrapperVM = ArrayUtils.find(nodeToWrapperVMs, n => n.wrapperName === name);
            if (nodeToWrapperVM == null)
                throw new Error("Could not find: " + name);
            return nodeToWrapperVM.syntaxKindNames;
        }
    }
}
