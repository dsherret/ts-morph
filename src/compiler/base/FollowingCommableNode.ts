import * as ts from "typescript";
import * as errors from "./../../errors";
import {Node} from "./../common";
import {SourceFile} from "./../file";

export interface FollowingCommableNode {
    hasFollowingComma(): boolean;
    getFollowingComma(): Node | undefined;
}

export function FollowingCommableNode<T extends Constructor<Node>>(Base: T): Constructor<FollowingCommableNode> & T {
    return class extends Base implements FollowingCommableNode {
        /**
         * Gets if this enum member ends with a comma.
         */
        hasFollowingComma() {
            return this.getFollowingComma() != null;
        }

        /**
         * Gets the following comma node if it exists.
         */
        getFollowingComma() {
            const nextSibling = this.getNextSibling();
            if (nextSibling == null || nextSibling.getKind() !== ts.SyntaxKind.CommaToken)
                return undefined;

            return nextSibling;
        }
    };
}
