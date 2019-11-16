import { tsMorph } from "@ts-morph/scripts";
import { ArrayUtils, Memoize } from "@ts-morph/common";
import { isNodeClass } from "../common";
import { WrappedNode, Mixin, Structure, KindToWrapperMapping } from "./tsMorph";
import { WrapperFactory } from "./WrapperFactory";

export interface DependencyNode {
    node: WrappedNode;
    childNodes: DependencyNode[];
    parentNodes: DependencyNode[];
}

export class TsMorphInspector {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly project: tsMorph.Project) {
    }

    getProject() {
        return this.project;
    }

    @Memoize
    getSrcDirectory(): tsMorph.Directory {
        return this.project.getDirectoryOrThrow("./src");
    }

    @Memoize
    getTestDirectory(): tsMorph.Directory {
        return this.project.getDirectoryOrThrow("./src/tests");
    }

    @Memoize
    getWrappedNodes(): WrappedNode[] {
        const compilerSourceFiles = this.project.getSourceFiles("src/compiler/**/*.ts");
        const classes = ArrayUtils.flatten(compilerSourceFiles.map(f => f.getClasses()));

        return classes.filter(c => isNodeClass(c)).map(c => this.wrapperFactory.getWrappedNode(c));
    }

    @Memoize
    getDependencyNodes() {
        const nodes = new Map<WrappedNode, DependencyNode>();

        for (const node of this.getWrappedNodes()) {
            const dependencyNode = getDependencyNode(node);
            const baseNode = node.getBase();

            if (baseNode != null) {
                const base = getDependencyNode(baseNode);
                dependencyNode.parentNodes.push(base);
                base.childNodes.push(dependencyNode);
            }
        }

        return Array.from(nodes.values());

        function getDependencyNode(node: WrappedNode) {
            if (nodes.has(node))
                return nodes.get(node)!;

            const dependencyNode: DependencyNode = {
                node,
                childNodes: [],
                parentNodes: []
            };
            nodes.set(node, dependencyNode);
            return dependencyNode;
        }
    }

    @Memoize
    getMixins(): Mixin[] {
        const mixins = new Set<Mixin>();
        for (const wrappedNode of this.getWrappedNodes()) {
            for (const mixin of wrappedNode.getMixins())
                mixins.add(mixin);
        }
        return Array.from(mixins.values());
    }

    @Memoize
    getPublicDeclarations(): tsMorph.ExportedDeclarations[] {
        const entries = Array.from(this.project.getSourceFileOrThrow("src/main.ts").getExportedDeclarations().entries());
        return ArrayUtils.flatten(entries.filter(([name]) => name !== "ts").map(([_, value]) => value));
    }

    @Memoize
    getPublicClasses(): tsMorph.ClassDeclaration[] {
        return this.getPublicDeclarations().filter(d => tsMorph.TypeGuards.isClassDeclaration(d)) as tsMorph.ClassDeclaration[];
    }

    @Memoize
    getPublicInterfaces(): tsMorph.InterfaceDeclaration[] {
        return this.getPublicDeclarations().filter(d => tsMorph.TypeGuards.isInterfaceDeclaration(d)) as tsMorph.InterfaceDeclaration[];
    }

    @Memoize
    getStructures(): Structure[] {
        const compilerSourceFiles = this.project.getSourceFiles("src/structures/**/*.ts");
        const interfaces = ArrayUtils.flatten(compilerSourceFiles.map(f => f.getInterfaces()));

        return interfaces.map(i => this.wrapperFactory.getStructure(i));
    }

    @Memoize
    getOverloadStructures() {
        return this.getStructures().filter(s => s.isOverloadStructure());
    }

    @Memoize
    getKindToWrapperMappings(): KindToWrapperMapping[] {
        const wrappedNodes = this.getWrappedNodes();
        const sourceFile = this.project.getSourceFileOrThrow("kindToWrapperMappings.ts");
        const kindToWrapperMappings = sourceFile.getVariableDeclaration("kindToWrapperMappings")!;
        const initializer = kindToWrapperMappings.getInitializer()!;
        const propertyAssignments = initializer.getDescendants().filter(d => tsMorph.TypeGuards.isPropertyAssignment(d)) as tsMorph.PropertyAssignment[];
        const result: { [wrapperName: string]: KindToWrapperMapping; } = {};

        for (const assignment of propertyAssignments) {
            const nameNode = (assignment.getInitializerOrThrow() as tsMorph.PropertyAccessExpression).getNameNode();
            const wrapperName = nameNode.getText();
            if (result[wrapperName] == null) {
                const wrappedNode = wrappedNodes.find(n => n.getName() === wrapperName);
                if (wrappedNode == null)
                    throw new Error(`Could not find the wrapped node for ${wrapperName}.`);
                result[wrapperName] = { wrapperName, wrappedNode, syntaxKindNames: [] };
            }

            result[wrapperName].syntaxKindNames.push(getSyntaxKindName(assignment));
        }

        return Object.keys(result).map(k => result[k]);

        function getSyntaxKindName(assignment: tsMorph.PropertyAssignment) {
            const computedPropertyName = assignment.getNameNode() as tsMorph.ComputedPropertyName;
            const propAccessExpr = computedPropertyName.getExpression() as tsMorph.PropertyAccessExpression;
            return propAccessExpr.getNameNode().getText();
        }
    }

    @Memoize
    getImplementedKindToNodeMappingsNames(): Map<string, string> {
        const sourceFile = this.project.getSourceFileOrThrow("kindToNodeMappings.ts");
        const mappings = sourceFile.getInterfaceOrThrow("ImplementedKindToNodeMappings");
        const result = new Map<string, string>();

        const error = `Exepcted all ImplementedKindToNodeMappings members to be [SyntaxKind.xxx]: compiler.yyy.`;

        mappings.getMembers().forEach(member => {
            if (!tsMorph.TypeGuards.isPropertySignature(member))
                throw new Error(error);

            const nameNode = member.getNameNode();
            if (!tsMorph.TypeGuards.isComputedPropertyName(nameNode))
                throw new Error(error);
            const nameNodeExpression = nameNode.getExpression();
            if (!tsMorph.TypeGuards.isPropertyAccessExpression(nameNodeExpression))
                throw new Error(error);
            const syntaxKind = nameNodeExpression.getName();

            const typeNode = member.getTypeNodeOrThrow();
            if (!tsMorph.TypeGuards.isTypeReferenceNode(typeNode))
                throw new Error(error);
            const typeNodeName = typeNode.getTypeName();
            if (!tsMorph.TypeGuards.isQualifiedName(typeNodeName))
                throw new Error(error);
            const compilerNodeName = typeNodeName.getRight().getText();

            result.set(syntaxKind, compilerNodeName);
        });
        return result;
    }
}
