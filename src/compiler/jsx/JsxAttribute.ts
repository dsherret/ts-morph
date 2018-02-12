import {ts} from "./../../typescript";
import * as errors from "./../../errors";
import {NamedNode} from "./../base";
import {Node} from "./../common";
import {StringLiteral} from "./../literal";
import {JsxExpression} from "./JsxExpression";

export class JsxAttribute extends NamedNode(Node)<ts.JsxAttribute> {
    /**
     * Gets the JSX attribute's initializer or throws if it doesn't exist.
     */
    getInitializerOrThrow() {
        return errors.throwIfNullOrUndefined(this.getInitializer(), `Expected to find an initializer for the JSX attribute '${this.getName()}'`);
    }

    /**
     * Gets the JSX attribute's initializer or returns undefined if it doesn't exist.
     */
    getInitializer() {
        return this.getNodeFromCompilerNodeIfExists<StringLiteral | JsxExpression>(this.compilerNode.initializer);
    }
}
