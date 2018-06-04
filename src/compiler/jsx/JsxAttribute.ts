import * as errors from "../../errors";
import { removeChildren } from "../../manipulation";
import { ts } from "../../typescript";
import { NamedNode } from "../base";
import { Node } from "../common";
import { StringLiteral } from "../literal";
import { JsxExpression } from "./JsxExpression";

export const JsxAttributeBase = NamedNode(Node);
export class JsxAttribute extends JsxAttributeBase<ts.JsxAttribute> {
    /**
     * Gets the JSX attribute's initializer or throws if it doesn't exist.
     */
    getInitializerOrThrow() {
        return errors.throwIfNullOrUndefined(this.getInitializer(), `Expected to find an initializer for the JSX attribute '${this.getName()}'`);
    }

    /**
     * Gets the JSX attribute's initializer or returns undefined if it doesn't exist.
     */
    getInitializer(): StringLiteral | JsxExpression | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.initializer);
    }

    /**
     * Removes the JSX attribute.
     */
    remove() {
        removeChildren({
            children: [this],
            removePrecedingNewLines: true,
            removePrecedingSpaces: true
        });
    }
}
