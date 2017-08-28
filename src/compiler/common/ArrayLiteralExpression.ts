import * as ts from "typescript";
import {Expression} from "./Expression";

export class ArrayLiteralExpression extends Expression<ts.ArrayLiteralExpression> {
    /**
     * Gets the array's elements.
     */
    getElements(): Expression[] {
        return this.compilerNode.elements.map(e => this.global.compilerFactory.getNodeFromCompilerNode(e, this.sourceFile)) as Expression[];
    }
}
