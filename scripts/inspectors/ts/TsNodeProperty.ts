import { Node, PropertySignature, PropertyDeclaration, Identifier, InterfaceDeclaration, ts, SyntaxKind } from "ts-morph";
import { Memoize, ArrayUtils } from "../../../src/utils";
import { WrapperFactory } from "../WrapperFactory";
import { TsNode } from "./TsNode";

export class TsNodeProperty {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: PropertySignature | PropertyDeclaration) {
    }

    getName() {
        return this.node.getName();
    }

    getTsNode(): TsNode {
        return this.wrapperFactory.getTsNode(this.node.getFirstAncestorByKindOrThrow(SyntaxKind.InterfaceDeclaration));
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

    findReferencedNodes(): Node[] {
        const referencedNodes: Node[] = [];
        const references = (this.node.getNameNode() as Identifier).findReferences();

        for (const reference of ArrayUtils.flatten(references.map(r => r.getReferences()))) {
            const sourceFile = reference.getSourceFile();
            if (sourceFile.getFilePath().indexOf("compiler") === -1)
                continue;

            const node = reference.getNode();
            referencedNodes.push(node);
        }

        return referencedNodes;
    }
}
