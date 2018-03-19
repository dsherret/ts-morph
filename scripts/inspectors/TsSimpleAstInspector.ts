import Project, {Node, ClassDeclaration, InterfaceDeclaration, PropertyAccessExpression, PropertyAssignment, ComputedPropertyName} from "../../src/main";
import {Memoize, ArrayUtils, TypeGuards, createHashSet} from "../../src/utils";
import {isNodeClass} from "../common";
import {WrappedNode, Mixin, Structure, NodeToWrapperMapping} from "./tsSimpleAst";
import {WrapperFactory} from "./WrapperFactory";

export class TsSimpleAstInspector {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly project: Project) {
    }

    getProject() {
        return this.project;
    }

    @Memoize
    getWrappedNodes(): WrappedNode[] {
        const compilerSourceFiles = this.project.getSourceFiles("src/compiler/**/*.ts");
        const classes = ArrayUtils.flatten(compilerSourceFiles.map(f => f.getClasses()));

        return classes.filter(c => isNodeClass(c)).map(c => this.wrapperFactory.getWrapperNode(c));
    }

    @Memoize
    getMixins(): Mixin[] {
        const mixins = createHashSet<Mixin>();
        for (const wrappedNode of this.getWrappedNodes()) {
            for (const mixin of wrappedNode.getMixins())
                mixins.add(mixin);
        }
        return ArrayUtils.from(mixins.values());
    }

    @Memoize
    getPublicDeclarations(): Node[] {
        return this.project.getSourceFileOrThrow("src/main.ts").getExportedDeclarations();
    }

    @Memoize
    getPublicClasses(): ClassDeclaration[] {
        return this.getPublicDeclarations().filter(d => TypeGuards.isClassDeclaration(d)) as ClassDeclaration[];
    }

    @Memoize
    getPublicInterfaces(): InterfaceDeclaration[] {
        return this.getPublicDeclarations().filter(d => TypeGuards.isInterfaceDeclaration(d)) as InterfaceDeclaration[];
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
    getNodeToWrapperMappings(): NodeToWrapperMapping[] {
        const wrappedNodes = this.getWrappedNodes();
        const sourceFile = this.project.getSourceFileOrThrow("nodeToWrapperMappings.ts");
        const nodeToWrapperMappings = sourceFile.getVariableDeclaration("nodeToWrapperMappings")!;
        const initializer = nodeToWrapperMappings.getInitializer()!;
        const propertyAssignments = initializer.getDescendants().filter(d => TypeGuards.isPropertyAssignment(d)) as PropertyAssignment[];
        const result: { [wrapperName: string]: NodeToWrapperMapping; } = {};

        for (const assignment of propertyAssignments) {
            const nameNode = (assignment.getInitializerOrThrow() as PropertyAccessExpression).getNameNode();
            const wrapperName = nameNode.getText();
            if (result[wrapperName] == null) {
                const wrappedNode = ArrayUtils.find(wrappedNodes, n => n.getName() === wrapperName);
                if (wrappedNode == null)
                    throw new Error(`Could not find the wrapped node for ${wrapperName}.`);
                result[wrapperName] = { wrapperName, wrappedNode, syntaxKindNames: [] };
            }

            result[wrapperName].syntaxKindNames.push(getSyntaxKindName(assignment));
        }

        return Object.keys(result).map(k => result[k]);

        function getSyntaxKindName(assignment: PropertyAssignment) {
            const computedPropertyName = assignment.getNameNode() as ComputedPropertyName;
            const propAccessExpr = computedPropertyName.getExpression() as PropertyAccessExpression;
            return propAccessExpr.getNameNode().getText();
        }
    }
}
