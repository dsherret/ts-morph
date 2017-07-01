import * as ts from "typescript";
import {removeNodes} from "./../../manipulation";
import {Node} from "./../common";
import {PropertyNamedNode, InitializerExpressionableNode, DocumentationableNode} from "./../base";

export const EnumMemberBase = DocumentationableNode(InitializerExpressionableNode(PropertyNamedNode(Node)));
export class EnumMember extends EnumMemberBase<ts.EnumMember> {
    /**
     * Gets the constant value of the enum.
     */
    getValue() {
        return this.factory.getTypeChecker().getConstantValue(this);
    }

    /**
     * Sets the enum value.
     * @param value - Enum value.
     */
    setValue(value: string | number) {
        let text: string;
        if (typeof value === "string") {
            const stringChar = this.factory.getLanguageService().getStringChar();
            text = stringChar + value + stringChar;
        }
        else {
            text = value.toString();
        }

        this.setInitializer(text);
        return this;
    }

    /**
     * Removes this enum member.
     */
    remove() {
        removeNodes([this, this.getNextSiblingIfKind(ts.SyntaxKind.CommaToken)]);
    }
}
