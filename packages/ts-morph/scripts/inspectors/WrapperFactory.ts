import { tsMorph } from "../deps.ts";
import { TsNode, TsNodeProperty } from "./ts/mod.ts";
import { Mixin, Structure, WrappedNode } from "./tsMorph/mod.ts";

export class WrapperFactory {
  readonly #wrappedNodeCache = new Map<tsMorph.ClassDeclaration, WrappedNode>();
  readonly #structureNodeCache = new Map<tsMorph.InterfaceDeclaration, Structure>();
  readonly #mixinNodeCache = new Map<tsMorph.Node, Mixin>();
  readonly #tsNodeCache = new Map<tsMorph.InterfaceDeclaration | tsMorph.ClassDeclaration, TsNode>();
  readonly #tsNodePropertyCache = new Map<tsMorph.PropertySignature | tsMorph.PropertyDeclaration, TsNodeProperty>();

  getWrappedNode(classDeclaration: tsMorph.ClassDeclaration) {
    let node = this.#wrappedNodeCache.get(classDeclaration);
    if (!node) {
      node = new WrappedNode(this, classDeclaration);
      this.#wrappedNodeCache.set(classDeclaration, node);
    }
    return node;
  }

  getWrappedNodes() {
    return Array.from(this.#wrappedNodeCache.values());
  }

  getMixin(interfaceDeclaration: tsMorph.InterfaceDeclaration) {
    let node = this.#mixinNodeCache.get(interfaceDeclaration);
    if (!node) {
      node = new Mixin(this, interfaceDeclaration);
      this.#mixinNodeCache.set(interfaceDeclaration, node);
    }
    return node;
  }

  getStructure(interfaceDeclaration: tsMorph.InterfaceDeclaration) {
    let node = this.#structureNodeCache.get(interfaceDeclaration);
    if (!node) {
      node = new Structure(this, interfaceDeclaration);
      this.#structureNodeCache.set(interfaceDeclaration, node);
    }
    return node;
  }

  getTsNode(tsNode: tsMorph.InterfaceDeclaration | tsMorph.ClassDeclaration) {
    let node = this.#tsNodeCache.get(tsNode);
    if (!node) {
      node = new TsNode(this, tsNode);
      this.#tsNodeCache.set(tsNode, node);
    }
    return node;
  }

  getTsNodeProperty(property: tsMorph.PropertySignature | tsMorph.PropertyDeclaration) {
    let node = this.#tsNodePropertyCache.get(property);
    if (!node) {
      node = new TsNodeProperty(this, property);
      this.#tsNodePropertyCache.set(property, node);
    }
    return node;
  }
}
