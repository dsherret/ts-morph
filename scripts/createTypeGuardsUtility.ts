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
import CodeBlockWriter from "code-block-writer";
import {ArrayUtils, KeyValueCache, StringUtils} from "../src/utils";
import {TsSimpleAstInspector, WrappedNode, Mixin} from "./inspectors";

interface MethodInfo {
    name: string;
    wrapperName: string;
    syntaxKinds: string[];
    isMixin: boolean;
}

export function createTypeGuardsUtility(inspector: TsSimpleAstInspector) {
    const file = inspector.getProject().getSourceFileOrThrow("./src/utils/TypeGuards.ts");
    const typeGuardsClass = file.getClassOrThrow("TypeGuards");
    const nodeToWrapperMappings = inspector.getNodeToWrapperMappings();

    // remove all the static methods that start with "is"
    typeGuardsClass.getStaticMethods()
        .filter(m => StringUtils.startsWith(m.getName(), "is"))
        .forEach(m => m.remove());

    typeGuardsClass.addMethods(getMethodInfos().map(method => ({
        name: `is${method.name}`,
        isStatic: true,
        docs: [{
            description: `Gets if the node is ${(method.name[0] === "A" || method.name[0] === "E") ? "an" : "a"} ${method.name}.\r\n` +
                "@param node - Node to check."
        }],
        parameters: [{ name: "node", type: "compiler.Node" }],
        returnType: `node is compiler.${method.wrapperName}` + (method.isMixin ? " & compiler.Node" : ""),
        bodyText: (writer: CodeBlockWriter) => {
            if (method.syntaxKinds.length === 1) {
                writer.writeLine(`return node.getKind() === SyntaxKind.${method.syntaxKinds[0]};`);
                return;
            }

            writer.write("switch (node.getKind())").block(() => {
                for (const syntaxKindName of method.syntaxKinds)
                    writer.writeLine(`case SyntaxKind.${syntaxKindName}:`);
                writer.indent().write("return true;").newLine();
                writer.writeLine("default:")
                    .indent().write("return false;").newLine();
            });
        }
    })));

    function getMethodInfos() {
        const methodInfos = new KeyValueCache<string, MethodInfo>();

        for (const node of inspector.getWrappedNodes().filter(n => n.getName() !== "Node" && isAllowedClass(n.getName()))) {
            const methodInfo = getMethodInfoForNode(node);
            const nodeBase = node.getBase();
            if (nodeBase != null)
                fillBase(node, nodeBase);
            fillMixinable(node, node);
        }

        const allowedBaseNames = ["Node", "Expression", "BooleanLiteral"];
        for (const nodeToWrapperMapping of nodeToWrapperMappings.filter(v => allowedBaseNames.indexOf(v.wrapperName) >= 0)) {
            for (const syntaxKindName of nodeToWrapperMapping.syntaxKindNames) {
                methodInfos.set(syntaxKindName, {
                    name: syntaxKindName,
                    wrapperName: nodeToWrapperMapping.wrapperName,
                    syntaxKinds: [syntaxKindName],
                    isMixin: false
                });
            }
        }

        return ArrayUtils.sortByProperty(methodInfos.getValuesAsArray(), info => info.name);

        function fillBase(node: WrappedNode, nodeBase: WrappedNode) {
            if (nodeBase.getName() === "Node")
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
            const nodeToWrapperVM = ArrayUtils.find(nodeToWrapperMappings, n => n.wrapperName === name);
            if (nodeToWrapperVM == null)
                return [] as string[];
            return nodeToWrapperVM.syntaxKindNames;
        }
    }
}

function isAllowedClass(name: string) {
    switch (name) {
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
