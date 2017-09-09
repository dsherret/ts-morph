import * as ts from "typescript";
import {removeChildren} from "./../../manipulation";
import {Node} from "./../common";

/**
 * A js doc node.
 */
export class JSDoc extends Node<ts.JSDoc> {
    /**
     * Removes this JSDoc.
     */
    remove() {
        removeChildren({
            children: [this],
            removeFollowingSpaces: true,
            removeFollowingNewLines: true
        });
    }
}
