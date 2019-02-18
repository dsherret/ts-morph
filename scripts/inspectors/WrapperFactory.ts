﻿import { Node, ClassDeclaration, InterfaceDeclaration, PropertySignature } from "ts-morph";
import { KeyValueCache } from "../../src/utils";
import { WrappedNode, Structure, Mixin } from "./tsMorph";
import { TsNode, TsNodeProperty } from "./ts";

export class WrapperFactory {
    private readonly wrappedNodeCache = new KeyValueCache<ClassDeclaration, WrappedNode>();
    private readonly structureNodeCache = new KeyValueCache<InterfaceDeclaration, Structure>();
    private readonly mixinNodeCache = new KeyValueCache<Node, Mixin>();
    private readonly tsNodeCache = new KeyValueCache<InterfaceDeclaration, TsNode>();
    private readonly tsNodePropertyCache = new KeyValueCache<PropertySignature, TsNodeProperty>();

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

    getTsNode(interfaceDeclaration: InterfaceDeclaration) {
        return this.tsNodeCache.getOrCreate(interfaceDeclaration, () => new TsNode(this, interfaceDeclaration));
    }

    getTsNodeProperty(propertySignature: PropertySignature) {
        return this.tsNodePropertyCache.getOrCreate(propertySignature, () => new TsNodeProperty(this, propertySignature));
    }
}
