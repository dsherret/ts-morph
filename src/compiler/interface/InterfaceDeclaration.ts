import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode, TypeParameteredNode} from "./../base";
import {MethodSignature} from "./MethodSignature";
import {PropertySignature} from "./PropertySignature";

export const InterfaceDeclarationBase = TypeParameteredNode(DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(NamedNode(Node))))));
export class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
    /**
     * Gets the interface method signatures.
     */
    getMethodSignatures(): MethodSignature[] {
        return this.node.members.filter(m => m.kind === ts.SyntaxKind.MethodSignature)
            .map(m => this.factory.getMethodSignature(m as ts.MethodSignature));
    }

    /**
     * Gets the interface property signatures.
     */
    getPropertySignatures(): PropertySignature[] {
        return this.node.members.filter(m => m.kind === ts.SyntaxKind.PropertySignature)
            .map(m => this.factory.getPropertySignature(m as ts.PropertySignature));
    }
}
