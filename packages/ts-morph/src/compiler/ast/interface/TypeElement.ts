import { ts } from "@ts-morph/common";
import { removeInterfaceMember } from "../../../manipulation";
import { Node } from "../common";

export class TypeElement<TNode extends ts.TypeElement = ts.TypeElement> extends Node<TNode> {
    /**
     * Removes the member.
     */
    remove() {
        removeInterfaceMember(this);
    }
}
