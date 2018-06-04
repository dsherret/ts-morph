import * as errors from "../../errors";
import { insertIntoParentTextRange } from "../../manipulation";
import { SyntaxKind, ts } from "../../typescript";
import { TypeGuards } from "../../utils";
import { EntityName } from "../aliases";
import { TypeArgumentedNode } from "../base";
import { TypeNode } from "./TypeNode";

export const ImportTypeNodeBase = TypeArgumentedNode(TypeNode);
export class ImportTypeNode extends ImportTypeNodeBase<ts.ImportTypeNode> {
    /**
     * Sets the argument text.
     * @param text - Text of the argument.
     */
    setArgument(text: string) {
        const arg = this.getArgument();
        if (TypeGuards.isLiteralTypeNode(arg)) {
            const literal = arg.getLiteral();
            if (TypeGuards.isStringLiteral(literal)) {
                literal.setLiteralValue(text);
                return this;
            }
        }

        arg.replaceWithText(writer => writer.quote(text), this.getWriterWithQueuedChildIndentation());
        return this;
    }

    /**
     * Gets the argument passed into the import type.
     */
    getArgument(): TypeNode {
        return this.getNodeFromCompilerNode(this.compilerNode.argument);
    }

    /**
     * Sets the qualifier text.
     * @param text - Text.
     */
    setQualifier(text: string) {
        const qualifier = this.getQualifier();

        if (qualifier != null)
            qualifier.replaceWithText(text, this.getWriterWithQueuedChildIndentation());
        else {
            const paren = this.getFirstChildByKindOrThrow(SyntaxKind.CloseParenToken);
            insertIntoParentTextRange({
                insertPos: paren.getEnd(),
                parent: this,
                newText: this.getWriterWithQueuedIndentation().write(".").write(text).toString()
            });
        }

        return this;
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
    getQualifier(): EntityName | undefined {
        return this.getNodeFromCompilerNodeIfExists(this.compilerNode.qualifier);
    }
}
