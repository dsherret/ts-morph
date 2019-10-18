import { ts } from "@ts-morph/common";
import { removeCommaSeparatedChild } from "../../../../manipulation";
import { Node } from "../../common";

// todo: There are ClassElement nodes like MethodDeclaration that should implement this as well so what's done here isn't really correct

export class ObjectLiteralElement<T extends ts.ObjectLiteralElement = ts.ObjectLiteralElement> extends Node<T> {
    /**
     * Removes the object literal element from the object literal expression.
     */
    remove() {
        removeCommaSeparatedChild(this);
    }
}
