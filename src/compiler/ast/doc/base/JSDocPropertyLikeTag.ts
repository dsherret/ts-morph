import { Constructor } from "../../../../types";
import { ts } from "../../../../typescript";
import { EntityName } from "../../aliases";
import { Node } from "../../common";
import { JSDocTag } from "../JSDocTag";

export type JSDocPropertyLikeTagExtensionType = Node<ts.JSDocPropertyLikeTag> & JSDocTag;

export interface JSDocPropertyLikeTag {
    /** Gets the name of the JS doc property like tag. */
    getName(): string;
    /** Gets the name node of the JS doc property like tag. */
    getNameNode(): EntityName;
}

export function JSDocPropertyLikeTag<T extends Constructor<JSDocPropertyLikeTagExtensionType>>(Base: T): Constructor<JSDocPropertyLikeTag> & T {
    return class extends Base implements JSDocPropertyLikeTag {
        // todo: more methods
        getName() {
            return this.getNameNode().getText();
        }

        getNameNode() {
            return this.getNodeFromCompilerNode(this.compilerNode.name);
        }
    };
}
