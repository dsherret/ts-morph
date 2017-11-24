import * as ts from "typescript";
import * as errors from "./../../../errors";
import {Expression} from "./../Expression";
import {Node} from "./../Node";
import {ObjectLiteralElementLike} from "./../../aliases";

export class ObjectLiteralExpression extends Expression<ts.ObjectLiteralExpression> {
    /**
     * Gets the properties.
     */
    getProperties(): ObjectLiteralElementLike[] {
        const properties: ts.NodeArray<ts.ObjectLiteralElementLike> = this.compilerNode.properties; // explicit type for validation
        return properties.map(p => this.global.compilerFactory.getNodeFromCompilerNode(p, this.sourceFile)) as ObjectLiteralElementLike[];
    }
}
