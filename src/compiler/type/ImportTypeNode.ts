import { ts } from "../../typescript";
import * as errors from "../../errors";
import { TypeArgumentedNode } from "../base";
import { QualifiedName, Identifier } from "../common";
import { TypeNode } from "./TypeNode";

export const ImportTypeNodeBase = TypeArgumentedNode(TypeNode);
export class ImportTypeNode extends ImportTypeNodeBase<ts.ImportTypeNode> {
    /**
     * Gets the argument passed into the import type.
     */
    getArgument(): TypeNode {
        return this.getNodeFromCompilerNode(this.compilerNode.argument);
    }

    /**
     * Gets the qualifier of the import type if it exists or throws
     */
    getQualifierOrThrow() {
        return errors.throwIfNullOrUndefined(this.getQualifier(), () => `Expected to find a qualifier for the import type: ${this.getText()}`);
    }

    /**
     * Gets the qualifier of the import type if it exists or returns undefined.
     */
    getQualifier(): QualifiedName | Identifier | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.qualifier);
    }
}
