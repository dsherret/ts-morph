import * as ts from "typescript";
import {InterfaceDeclaration, ClassDeclaration} from "./../../../src/main";
import {Memoize, ArrayUtils} from "./../../../src/utils";
import {WrapperFactory} from "./../WrapperFactory";
import {WrappedNode} from "./../tsSimpleAst";

export class TsNode {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: InterfaceDeclaration) {
    }

    @Memoize
    getName() {
        return this.node.getName();
    }

    @Memoize
    getAssociatedWrappedNode(): WrappedNode | undefined {
        const references = this.node.getNameNode().findReferences();
        for (const reference of ArrayUtils.flatten(references.map(r => r.getReferences()))) {
            const sourceFile = reference.getSourceFile();
            const node = reference.getNode();
            if (sourceFile.getFilePath().indexOf("compiler") === -1)
                continue;
            const classDec = node.getFirstAncestorByKind(ts.SyntaxKind.ClassDeclaration);
            if (classDec != null)
                return this.wrapperFactory.getWrapperNode(classDec as ClassDeclaration);
        }
        return undefined;
    }
}
