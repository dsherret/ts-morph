import { Memoize, tsMorph } from "../../deps.ts";
import { WrappedNode } from "../tsMorph/mod.ts";
import { WrapperFactory } from "../WrapperFactory.ts";
import { TsNodeProperty } from "./TsNodeProperty.ts";

export class TsNode {
  readonly #wrapperFactory: WrapperFactory;
  readonly #node: tsMorph.InterfaceDeclaration | tsMorph.ClassDeclaration;

  constructor(wrapperFactory: WrapperFactory, node: tsMorph.InterfaceDeclaration | tsMorph.ClassDeclaration) {
    this.#wrapperFactory = wrapperFactory;
    this.#node = node;
  }

  getName() {
    return this.#node.getName()!;
  }

  isTsMorphTsNode() {
    return this.#node.getSourceFile().getFilePath().indexOf("/src/compiler/ast") >= 0;
  }

  getNameForType() {
    const typeParams = this.#node.getTypeParameters().map(p => p.getDefault() == null);
    if (typeParams.length > 0)
      return this.#node.getName() + "<" + typeParams.map(_ => "any").join(", ") + ">";
    return this.#node.getName();
  }

  getInterface() {
    return this.#node;
  }

  @Memoize
  getAssociatedWrappedNode(): WrappedNode | undefined {
    const references = this.#node.getNameNode()!.findReferencesAsNodes();
    for (const node of references) {
      const sourceFile = node.getSourceFile();
      if (sourceFile.getFilePath().indexOf("compiler") === -1)
        continue;

      const classDec = node.getFirstAncestorByKind(tsMorph.SyntaxKind.ClassDeclaration);
      if (classDec != null && classDec.getName() === this.getName())
        return this.#wrapperFactory.getWrappedNode(classDec);
    }
    return undefined;
  }

  getProperties(): TsNodeProperty[] {
    const node = this.#node;
    return getProperties().map(p => this.#wrapperFactory.getTsNodeProperty(p));

    function getProperties(): (tsMorph.PropertyDeclaration | tsMorph.PropertySignature)[] {
      if (tsMorph.Node.isClassDeclaration(node)) {
        const result: (tsMorph.PropertyDeclaration | tsMorph.PropertySignature)[] = [];
        for (const prop of node.getInstanceProperties()) {
          if (tsMorph.Node.isPropertyDeclaration(prop))
            result.push(prop);
          else
            throw new Error("Unhandled scenario where node was: " + prop.getKindName());
        }
        return result;
      } else {
        return node.getProperties();
      }
    }
  }
}
