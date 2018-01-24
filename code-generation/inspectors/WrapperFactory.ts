import {ClassDeclaration, InterfaceDeclaration} from "./../../src/main";
import {KeyValueCache} from "./../../src/utils";
import {WrappedNode, Structure} from "./tsSimpleAst";
import {TsNode} from "./ts";

export class WrapperFactory {
    private readonly wrapperNodeCache = new KeyValueCache<ClassDeclaration, WrappedNode>();
    private readonly structureNodeCache = new KeyValueCache<InterfaceDeclaration, Structure>();
    private readonly tsNodeCache = new KeyValueCache<InterfaceDeclaration, TsNode>();

    getWrapperNode(classDeclaration: ClassDeclaration) {
        return this.wrapperNodeCache.getOrCreate(classDeclaration, () => new WrappedNode(this, classDeclaration));
    }

    getStructure(interfaceDeclaration: InterfaceDeclaration) {
        return this.structureNodeCache.getOrCreate(interfaceDeclaration, () => new Structure(this, interfaceDeclaration));
    }

    getTsNode(interfaceDeclaration: InterfaceDeclaration) {
        return this.tsNodeCache.getOrCreate(interfaceDeclaration, () => new TsNode(this, interfaceDeclaration));
    }
}
