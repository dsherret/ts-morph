import { ts } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { EntityName } from "../../aliases";
import { Node } from "../../common";
import { JSDocTag } from "../JSDocTag";
import { JSDocTypeExpression } from "../JSDocTypeExpression";

export type JSDocPropertyLikeTagExtensionType = Node<ts.JSDocPropertyLikeTag> & JSDocTag;

export interface JSDocPropertyLikeTag {
    /** Gets the type expression node of the JS doc property like tag. */
    getTypeExpression(): JSDocTypeExpression | undefined;
    /** Gets the name of the JS doc property like tag. */
    getName(): string;
    /** Gets the name node of the JS doc property like tag. */
    getNameNode(): EntityName;
    /** Checks if the JS doc property like tag is bracketed. */
    isBracketed(): boolean;
}

export function JSDocPropertyLikeTag<T extends Constructor<JSDocPropertyLikeTagExtensionType>>(Base: T): Constructor<JSDocPropertyLikeTag> & T {
    return class extends Base implements JSDocPropertyLikeTag {
        // todo: more methods
        getTypeExpression() {
            return this._getNodeFromCompilerNodeIfExists(this.compilerNode.typeExpression);
        }

        getName() {
            return this.getNameNode().getText();
        }

        getNameNode() {
            return this._getNodeFromCompilerNode(this.compilerNode.name);
        }

        isBracketed() {
            return this.compilerNode.isBracketed;
        }
    };
}
