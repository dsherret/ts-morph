import {ts, SyntaxKind} from "../../typescript";
import {removeChildrenWithFormatting, FormattingKind} from "../../manipulation";
import {EnumMemberStructure} from "../../structures";
import {callBaseFill} from "../callBaseFill";
import {Node} from "../common";
import {PropertyNamedNode, InitializerExpressionableNode, JSDocableNode} from "../base";

export const EnumMemberBase = JSDocableNode(InitializerExpressionableNode(PropertyNamedNode(Node)));
export class EnumMember extends EnumMemberBase<ts.EnumMember> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<EnumMemberStructure>) {
        callBaseFill(EnumMemberBase.prototype, this, structure);

        if (structure.value != null)
            this.setValue(structure.value);

        return this;
    }

    /**
     * Gets the constant value of the enum.
     */
    getValue() {
        return this.global.typeChecker.getConstantValue(this);
    }

    /**
     * Sets the enum value.
     * @param value - Enum value.
     */
    setValue(value: string | number) {
        let text: string;
        if (typeof value === "string") {
            const quoteType = this.global.manipulationSettings.getQuoteType();
            text = quoteType + value + quoteType;
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
        const childrenToRemove: Node[] = [this];
        const commaToken = this.getNextSiblingIfKind(SyntaxKind.CommaToken);
        if (commaToken != null)
            childrenToRemove.push(commaToken);
        removeChildrenWithFormatting({
            children: childrenToRemove,
            getSiblingFormatting: () => FormattingKind.Newline
        });
    }
}
