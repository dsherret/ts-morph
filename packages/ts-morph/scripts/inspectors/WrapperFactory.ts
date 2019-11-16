import { tsMorph } from "@ts-morph/scripts";
import { KeyValueCache } from "@ts-morph/common";
import { WrappedNode, Structure, Mixin } from "./tsMorph";
import { TsNode, TsNodeProperty } from "./ts";

export class WrapperFactory {
    private readonly wrappedNodeCache = new KeyValueCache<tsMorph.ClassDeclaration, WrappedNode>();
    private readonly structureNodeCache = new KeyValueCache<tsMorph.InterfaceDeclaration, Structure>();
    private readonly mixinNodeCache = new KeyValueCache<tsMorph.Node, Mixin>();
    private readonly tsNodeCache = new KeyValueCache<tsMorph.InterfaceDeclaration | tsMorph.ClassDeclaration, TsNode>();
    private readonly tsNodePropertyCache = new KeyValueCache<tsMorph.PropertySignature | tsMorph.PropertyDeclaration, TsNodeProperty>();

    getWrappedNode(classDeclaration: tsMorph.ClassDeclaration) {
        return this.wrappedNodeCache.getOrCreate(classDeclaration, () => new WrappedNode(this, classDeclaration));
    }

    getWrappedNodes() {
        return this.wrappedNodeCache.getValuesAsArray();
    }

    getMixin(interfaceDeclaration: tsMorph.InterfaceDeclaration) {
        return this.mixinNodeCache.getOrCreate(interfaceDeclaration, () => new Mixin(this, interfaceDeclaration));
    }

    getStructure(interfaceDeclaration: tsMorph.InterfaceDeclaration) {
        return this.structureNodeCache.getOrCreate(interfaceDeclaration, () => new Structure(this, interfaceDeclaration));
    }

    getTsNode(tsNode: tsMorph.InterfaceDeclaration | tsMorph.ClassDeclaration) {
        return this.tsNodeCache.getOrCreate(tsNode, () => new TsNode(this, tsNode));
    }

    getTsNodeProperty(property: tsMorph.PropertySignature | tsMorph.PropertyDeclaration) {
        return this.tsNodePropertyCache.getOrCreate(property, () => new TsNodeProperty(this, property));
    }
}
