import * as ts from "typescript";
import {Node} from "./../common";

export interface FollowingCommableNode {
    /**
     * Gets if this enum member ends with a comma.
     */
    hasFollowingComma(): boolean;
    /**
     * Gets the following comma node if it exists.
     */
    getFollowingComma(): Node | undefined;
}

export function FollowingCommableNode<T extends Constructor<Node>>(Base: T): Constructor<FollowingCommableNode> & T {
    return class extends Base implements FollowingCommableNode {
        hasFollowingComma() {
            return this.getFollowingComma() != null;
        }

        getFollowingComma() {
            const nextSibling = this.getNextSibling();
            if (nextSibling == null || nextSibling.getKind() !== ts.SyntaxKind.CommaToken)
                return undefined;

            return nextSibling;
        }
    };
}
