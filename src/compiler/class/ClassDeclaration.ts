import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, AmbientableNode, DocumentationableNode, TypeParameteredNode} from "./../base";
import {MethodDeclaration} from "./MethodDeclaration";
import {PropertyDeclaration} from "./PropertyDeclaration";

export const ClassDeclarationBase = TypeParameteredNode(DocumentationableNode(AmbientableNode(ExportableNode(NamedNode(Node)))));
export class ClassDeclaration extends ClassDeclarationBase<ts.ClassDeclaration> {
    /**
     * Gets the class instance method declarations.
     */
    getInstanceMethodDeclarations(): MethodDeclaration[] {
        return this.getInstanceMembers().filter(m => m instanceof MethodDeclaration) as MethodDeclaration[];
    }

    /**
     * Gets the class instance property declarations.
     */
    getInstancePropertyDeclarations(): PropertyDeclaration[] {
        return this.getInstanceMembers().filter(m => m instanceof PropertyDeclaration) as PropertyDeclaration[];
    }

    /**
     * Gets the instance members.
     */
    getInstanceMembers() {
        return this.getAllMembers().filter(m => !m.isStatic());
    }

    /**
     * Gets the class instance method declarations.
     */
    getStaticMethodDeclarations(): MethodDeclaration[] {
        return this.getStaticMembers().filter(m => m instanceof MethodDeclaration) as MethodDeclaration[];
    }

    /**
     * Gets the class instance property declarations.
     */
    getStaticPropertyDeclarations(): PropertyDeclaration[] {
        return this.getStaticMembers().filter(m => m instanceof PropertyDeclaration) as PropertyDeclaration[];
    }

    /**
     * Gets the static members.
     */
    getStaticMembers() {
        return this.getAllMembers().filter(m => m.isStatic());
    }

    /**
     * Gets the instance and static members.
     */
    getAllMembers() {
        return this.node.members
            .map(m => this.factory.getNodeFromCompilerNode(m)) as (MethodDeclaration | PropertyDeclaration)[];
    }
}
