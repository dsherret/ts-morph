import { ts, errors } from "@ts-morph/common";
import { Constructor } from "../../../../types";
import { EntityName } from "../../aliases";
import { Node } from "../../common";
import { JSDocTag } from "../JSDocTag";
import { JSDocTypeExpression } from "../JSDocTypeExpression";

export type JSDocPropertyLikeTagExtensionType = Node<ts.JSDocPropertyLikeTag> & JSDocTag;

export interface JSDocPropertyLikeTag {
    /** Gets the type expression node of the JS doc tag if it exists. */
    getTypeExpression(): JSDocTypeExpression | undefined;
    /** Gets the type expression node of the JS doc tag or throws if it doesn't exist. */
    getTypeExpressionOrThrow(): JSDocTypeExpression;
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
        getTypeExpression(): JSDocTypeExpression | undefined {
            return this._getNodeFromCompilerNodeIfExists(this.compilerNode.typeExpression);
        }

        getTypeExpressionOrThrow() {
            return errors.throwIfNullOrUndefined(this.getTypeExpression(), `Expected to find a JS doc type expression.`);
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
