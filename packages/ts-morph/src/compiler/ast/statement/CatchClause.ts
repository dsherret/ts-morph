import { errors, ts } from "@ts-morph/common";
import { Node } from "../common";
import { Block } from "./Block";
import { VariableDeclaration } from "../variable";

export const CatchClauseBase = Node;
export class CatchClause extends CatchClauseBase<ts.CatchClause> {
    /**
     * Gets this catch clause's block.
     */
    getBlock(): Block {
        return this._getNodeFromCompilerNode(this.compilerNode.block);
    }

    /**
     * Gets this catch clause's variable declaration or undefined if none exists.
     */
    getVariableDeclaration(): VariableDeclaration | undefined {
        return this._getNodeFromCompilerNodeIfExists(this.compilerNode.variableDeclaration);
    }

    /**
     * Gets this catch clause's variable declaration or throws if none exists.
     */
    getVariableDeclarationOrThrow() {
        return errors.throwIfNullOrUndefined(this.getVariableDeclaration(), "Expected to find a variable declaration.");
    }
}
