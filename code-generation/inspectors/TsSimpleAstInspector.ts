import TsSimpleAst, {Node, ClassDeclaration, InterfaceDeclaration} from "./../../src/main";
import {Memoize, ArrayUtils, TypeGuards} from "./../../src/utils";
import {isNodeClass} from "./../common";
import {WrappedNode, Structure} from "./tsSimpleAst";
import {WrapperFactory} from "./WrapperFactory";

export class TsSimpleAstInspector {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly ast: TsSimpleAst) {
    }

    @Memoize
    getWrappedNodes(): WrappedNode[] {
        const compilerSourceFiles = this.ast.getSourceFiles("**/src/compiler/**/*.ts");
        const classes = ArrayUtils.flatten(compilerSourceFiles.map(f => f.getClasses()));

        return classes.filter(c => isNodeClass(c)).map(c => this.wrapperFactory.getWrapperNode(c));
    }

    @Memoize
    getPublicDeclarations(): Node[] {
        return this.ast.getSourceFileOrThrow("src/main.ts").getExportedDeclarations();
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
        const compilerSourceFiles = this.ast.getSourceFiles("**/src/structures/**/*.ts");
        const interfaces = ArrayUtils.flatten(compilerSourceFiles.map(f => f.getInterfaces()));

        return interfaces.map(i => this.wrapperFactory.getStructure(i));
    }

    @Memoize
    getOverloadStructures() {
        return this.getStructures().filter(s => s.isOverloadStructure());
    }
}
