import { InterfaceDeclaration, SyntaxKind, ClassDeclaration, TypeGuards, PropertyDeclaration, PropertySignature } from "ts-morph";
import { Memoize } from "../../../src/utils";
import { WrapperFactory } from "../WrapperFactory";
import { WrappedNode } from "../tsMorph";
import { TsNodeProperty } from "./TsNodeProperty";

export class TsNode {
    constructor(private readonly wrapperFactory: WrapperFactory, private readonly node: InterfaceDeclaration | ClassDeclaration) {
    }

    getName() {
        return this.node.getName()!;
    }

    isTsMorphTsNode() {
        return this.node.getSourceFile().getFilePath().indexOf("/src/compiler/ast") >= 0;
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
        const references = this.node.getNameNode()!.findReferencesAsNodes();
        for (const node of references) {
            const sourceFile = node.getSourceFile();
            if (sourceFile.getFilePath().indexOf("compiler") === -1)
                continue;

            const classDec = node.getFirstAncestorByKind(SyntaxKind.ClassDeclaration);
            if (classDec != null && classDec.getName() === this.getName())
                return this.wrapperFactory.getWrappedNode(classDec);
        }
        return undefined;
    }

    getProperties(): TsNodeProperty[] {
        const node = this.node;
        return getProperties().map(p => this.wrapperFactory.getTsNodeProperty(p));

        function getProperties(): (PropertyDeclaration | PropertySignature)[] {
            if (TypeGuards.isClassDeclaration(node)) {
                const result: (PropertyDeclaration | PropertySignature)[] = [];
                for (const prop of node.getInstanceProperties()) {
                    if (TypeGuards.isPropertyDeclaration(prop))
                        result.push(prop);
                    else
                        throw new Error("Unhandled scenario where node was: " + prop.getKindName());
                }
                return result;
            }
            else {
                return node.getProperties();
            }
        }
    }
}
