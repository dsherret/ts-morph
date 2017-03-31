import * as ts from "typescript";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode, TypeParameteredNode} from "./../base";
import {AbstractableNode} from "./base";
import {MethodDeclaration} from "./MethodDeclaration";
import {PropertyDeclaration} from "./PropertyDeclaration";
import {GetAccessorDeclaration} from "./GetAccessorDeclaration";
import {SetAccessorDeclaration} from "./SetAccessorDeclaration";

export type ClassPropertyTypes = PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;

export const ClassDeclarationBase = TypeParameteredNode(DocumentationableNode(AmbientableNode(AbstractableNode(ExportableNode(ModifierableNode(NamedNode(Node)))))));
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
    getInstanceProperties(): ClassPropertyTypes[] {
        return this.getInstanceMembers()
            .filter(m => isClassPropertyType(m)) as ClassPropertyTypes[];
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
    getStaticProperties(): ClassPropertyTypes[] {
        return this.getStaticMembers()
            .filter(m => isClassPropertyType(m)) as ClassPropertyTypes[];
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
            .map(m => this.factory.getNodeFromCompilerNode(m)) as (MethodDeclaration | PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration)[];
    }
}

function isClassPropertyType(m: Node<ts.Node>): m is ClassPropertyTypes {
    return m instanceof PropertyDeclaration || m instanceof SetAccessorDeclaration || m instanceof GetAccessorDeclaration;
}
