import { Node, ClassDeclaration, InterfaceDeclaration, PropertySignature, PropertyDeclaration } from "ts-morph";
import { KeyValueCache } from "@ts-morph/common";
import { WrappedNode, Structure, Mixin } from "./tsMorph";
import { TsNode, TsNodeProperty } from "./ts";

export class WrapperFactory {
    private readonly wrappedNodeCache = new KeyValueCache<ClassDeclaration, WrappedNode>();
    private readonly structureNodeCache = new KeyValueCache<InterfaceDeclaration, Structure>();
    private readonly mixinNodeCache = new KeyValueCache<Node, Mixin>();
    private readonly tsNodeCache = new KeyValueCache<InterfaceDeclaration | ClassDeclaration, TsNode>();
    private readonly tsNodePropertyCache = new KeyValueCache<PropertySignature | PropertyDeclaration, TsNodeProperty>();

    getWrappedNode(classDeclaration: ClassDeclaration) {
        return this.wrappedNodeCache.getOrCreate(classDeclaration, () => new WrappedNode(this, classDeclaration));
    }

    getWrappedNodes() {
        return this.wrappedNodeCache.getValuesAsArray();
    }

    getMixin(interfaceDeclaration: InterfaceDeclaration) {
        return this.mixinNodeCache.getOrCreate(interfaceDeclaration, () => new Mixin(this, interfaceDeclaration));
    }

    getStructure(interfaceDeclaration: InterfaceDeclaration) {
        return this.structureNodeCache.getOrCreate(interfaceDeclaration, () => new Structure(this, interfaceDeclaration));
    }

    getTsNode(tsNode: InterfaceDeclaration | ClassDeclaration) {
        return this.tsNodeCache.getOrCreate(tsNode, () => new TsNode(this, tsNode));
    }

    getTsNodeProperty(property: PropertySignature | PropertyDeclaration) {
        return this.tsNodePropertyCache.getOrCreate(property, () => new TsNodeProperty(this, property));
    }
}
