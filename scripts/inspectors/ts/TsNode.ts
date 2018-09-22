import { InterfaceDeclaration, ClassDeclaration, ts, SyntaxKind } from "ts-simple-ast";
import { Memoize, ArrayUtils } from "../../../src/utils";
import { WrapperFactory } from "../WrapperFactory";
import { WrappedNode } from "../tsSimpleAst";
import { TsNodeProperty } from "./TsNodeProperty";

export class TsNode {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: InterfaceDeclaration) {
    }

    getName() {
        return this.node.getName();
    }

    getNameForType() {
        const typeParams = this.node.getTypeParameters().map(p => p.getDefault() == null);
        if (typeParams.length > 0)
            return this.node.getName() + "<" + typeParams.map(_ => "any").join(", ") + ">";
        return this.node.getName();
    }

    getInterface() {
        return this.node;
    }

    @Memoize
    getAssociatedWrappedNode(): WrappedNode | undefined {
        const references = this.node.getNameNode().findReferences();
        for (const reference of ArrayUtils.flatten(references.map(r => r.getReferences()))) {
            const sourceFile = reference.getSourceFile();
            if (sourceFile.getFilePath().indexOf("compiler") === -1)
                continue;
            const node = reference.getNode();
            // ignore nodes in blocks
            if (node.getFirstAncestorByKind(SyntaxKind.Block) != null)
                continue;
            const classDec = node.getFirstAncestorByKind(SyntaxKind.ClassDeclaration);
            if (classDec != null)
                return this.wrapperFactory.getWrappedNode(classDec);
        }
        return undefined;
    }

    getProperties(): TsNodeProperty[] {
        return this.node.getProperties().map(p => this.wrapperFactory.getTsNodeProperty(p));
    }
}
