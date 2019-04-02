import { removeClassMember } from "../../../manipulation";
import { ts } from "../../../typescript";
import { Node } from "../common";

export class ClassElement<T extends ts.ClassElement = ts.ClassElement> extends Node<T> {
    /**
     * Removes the class member.
     */
    remove() {
        removeClassMember(this);
    }
}
