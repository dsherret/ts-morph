import {ClassDeclaration, InterfaceDeclaration} from "./../../src/main";
import {KeyValueCache} from "./../../src/utils";
import {WrappedNode} from "./tsSimpleAst";
import {TsNode} from "./ts";

export class WrapperFactory {
    private readonly wrapperNodeCache = new KeyValueCache<ClassDeclaration, WrappedNode>();
    private readonly tsNodeCache = new KeyValueCache<InterfaceDeclaration, TsNode>();

    getWrapperNode(classDeclaration: ClassDeclaration) {
        return this.wrapperNodeCache.getOrCreate(classDeclaration, () => new WrappedNode(this, classDeclaration));
    }

    getTsNode(interfaceDeclaration: InterfaceDeclaration) {
        return this.tsNodeCache.getOrCreate(interfaceDeclaration, () => new TsNode(this, interfaceDeclaration));
    }
}
