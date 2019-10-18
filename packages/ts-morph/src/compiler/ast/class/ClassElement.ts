import { errors, ts } from "@ts-morph/common";
import { removeClassMember, removeCommaSeparatedChild } from "../../../manipulation";
import { TypeGuards } from "../../../utils";
import { Node } from "../common";

export class ClassElement<T extends ts.ClassElement = ts.ClassElement> extends Node<T> {
    /**
     * Removes the class member.
     */
    remove() {
        const parent = this.getParentOrThrow();
        if (TypeGuards.isClassDeclaration(parent) || TypeGuards.isClassExpression(parent))
            removeClassMember(this);
        else if (TypeGuards.isObjectLiteralExpression(parent))
            removeCommaSeparatedChild(this);
        else
            errors.throwNotImplementedForSyntaxKindError(parent.getKind());
    }
}
