import { removeInterfaceMember } from "../../../manipulation";
import { ts } from "../../../typescript";
import { Node } from "../common";

export class TypeElement<TNode extends ts.TypeElement = ts.TypeElement> extends Node<TNode> {
    /**
     * Removes the member.
     */
    remove() {
        removeInterfaceMember(this);
    }
}
