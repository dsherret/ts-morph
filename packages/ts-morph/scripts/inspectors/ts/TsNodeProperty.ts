import { Memoize, tsMorph } from "../../../../scripts/mod.ts";
import { WrapperFactory } from "../WrapperFactory.ts";
import { TsNode } from "./TsNode.ts";

export class TsNodeProperty {
  constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: tsMorph.PropertySignature | tsMorph.PropertyDeclaration) {
  }

  getName() {
    return this.node.getName();
  }

  getTsNode(): TsNode {
    return this.wrapperFactory.getTsNode(this.node.getFirstAncestorByKindOrThrow(tsMorph.SyntaxKind.InterfaceDeclaration));
  }

  @Memoize
  isReferenced() {
    if (this.findReferencedNodes().length > 0)
      return true;
    const wrappedNode = this.getTsNode().getAssociatedWrappedNode();
    if (wrappedNode == null)
      return false;
    const name = this.getName();
    return wrappedNode.getMixins().some(m => m.getCoveredTsNodePropertyNames().some(n => n === name));
  }

  findReferencedNodes(): tsMorph.Node[] {
    const referencedNodes: tsMorph.Node[] = [];
    const references = (this.node.getNameNode() as tsMorph.Identifier).findReferences();

    for (const reference of references.map(r => r.getReferences()).flat()) {
      const sourceFile = reference.getSourceFile();
      if (sourceFile.getFilePath().indexOf("compiler") === -1)
        continue;

      const node = reference.getNode();
      referencedNodes.push(node);
    }

    return referencedNodes;
  }
}
