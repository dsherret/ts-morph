import {ts} from "../../typescript";
import * as errors from "../../errors";
import {Block} from "./Block";
import {Statement} from "./Statement";
import {Node} from "../common";
import {VariableDeclaration} from "./VariableDeclaration";

export const CatchClauseBase = Node;
export class CatchClause extends CatchClauseBase<ts.CatchClause> {
    /**
     * Gets this catch clause's block.
     */
    getBlock() {
        return this.getNodeFromCompilerNode<Block>(this.compilerNode.block);
    }

    /**
     * Gets this catch clause's variable declaration or undefined if none exists.
     */
    getVariableDeclaration() {
        return this.getNodeFromCompilerNodeIfExists<VariableDeclaration>(this.compilerNode.variableDeclaration);
    }

    /**
     * Gets this catch clause's variable declaration or throws if none exists.
     */
    getVariableDeclarationOrThrow() {
        return errors.throwIfNullOrUndefined(this.getVariableDeclaration(), "Expected to find a variable declaration.");
    }
}
