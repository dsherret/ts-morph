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
import TsSimpleAst, {ClassDeclaration, MethodDeclaration, MethodDeclarationStructure, Scope} from "./../src/main";
import {NodeToWrapperViewModel, ClassViewModel, MixinableViewModel} from "./view-models";

interface MethodInfo {
    name: string;
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
            returnType: `node is compiler.${method.name}` + (method.isMixin ? " & compiler.Node" : ""),
            bodyText: `switch (node.getKind()) {\r\n` +
                method.syntaxKinds.map(k => `    case ts.SyntaxKind.${k}:`).join("\r\n") + "\r\n" +
                "        return true;\r\n" +
                "    default:\r\n" +
                "        return false;\r\n" +
                "}"
        }))
    });

    file.save();

    function getMethodInfos() {
        const methodInfos: { [name: string]: MethodInfo; } = {};

        for (const classVM of classVMs.filter(c => nodeToWrapperVMs.some(vm => vm.wrapperName === c.name))) {
            methodInfos[classVM.name] = {
                name: classVM.name,
                syntaxKinds: [getSyntaxKindForName(classVM.name)],
                isMixin: false
            };

            fillMixinable(classVM, classVM);
        }

        return Object.keys(methodInfos).sort().map(k => methodInfos[k]);

        function fillMixinable(classVM: ClassViewModel, mixinable: MixinableViewModel) {
            for (const mixin of mixinable.mixins) {
                if (methodInfos[mixin.name] == null) {
                    methodInfos[mixin.name] = {
                        name: mixin.name,
                        syntaxKinds: [],
                        isMixin: true
                    };
                }
                methodInfos[mixin.name].syntaxKinds.push(getSyntaxKindForName(classVM.name));
                fillMixinable(classVM, mixin);
            }
        }

        function getSyntaxKindForName(name: string) {
            const nodeToWrapperVM = nodeToWrapperVMs.find(n => n.wrapperName === name);
            if (nodeToWrapperVM == null)
                throw new Error("Could not find: " + name);
            return nodeToWrapperVM.syntaxKindName;
        }
    }
}
