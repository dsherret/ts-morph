import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode, TypeParameteredNode, HeritageClauseableNode,
    ExtendsClauseableNode} from "./../base";
import {MethodSignature} from "./MethodSignature";
import {PropertySignature} from "./PropertySignature";

export const InterfaceDeclarationBase = ExtendsClauseableNode(HeritageClauseableNode(TypeParameteredNode(DocumentationableNode(AmbientableNode(
    ExportableNode(ModifierableNode(NamedNode(Node)))
)))));
export class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
    /**
     * Gets the interface method signatures.
     */
    getMethods(): MethodSignature[] {
        return this.node.members.filter(m => m.kind === ts.SyntaxKind.MethodSignature)
            .map(m => this.factory.getMethodSignature(m as ts.MethodSignature, this.sourceFile));
    }

    /**
     * Gets the interface property signatures.
     */
    getProperties(): PropertySignature[] {
        return this.node.members.filter(m => m.kind === ts.SyntaxKind.PropertySignature)
            .map(m => this.factory.getPropertySignature(m as ts.PropertySignature, this.sourceFile));
    }
}
