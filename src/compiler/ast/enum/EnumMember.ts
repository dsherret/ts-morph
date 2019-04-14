import { FormattingKind, removeChildrenWithFormatting } from "../../../manipulation";
import { EnumMemberStructure, EnumMemberSpecificStructure } from "../../../structures";
import { SyntaxKind, ts } from "../../../typescript";
import { StringUtils } from "../../../utils";
import { InitializerExpressionableNode, JSDocableNode, PropertyNamedNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";

export const EnumMemberBase = JSDocableNode(InitializerExpressionableNode(PropertyNamedNode(Node)));
export class EnumMember extends EnumMemberBase<ts.EnumMember> {
    /**
     * Gets the constant value of the enum.
     */
    getValue() {
        return this._context.typeChecker.getConstantValue(this);
    }

    /**
     * Sets the enum value.
     * @param value - Enum value.
     */
    setValue(value: string | number) {
        let text: string;
        if (typeof value === "string") {
            const quoteKind = this._context.manipulationSettings.getQuoteKind();
            text = quoteKind + StringUtils.escapeForWithinString(value, quoteKind) + quoteKind;
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

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<EnumMemberStructure>) {
        callBaseSet(EnumMemberBase.prototype, this, structure);

        if (structure.value != null)
            this.setValue(structure.value);
        else if (structure.hasOwnProperty(nameof(structure.value)) && structure.initializer == null)
            this.removeInitializer();

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure() {
        return callBaseGetStructure<EnumMemberSpecificStructure>(EnumMemberBase.prototype, this, {
            // never return the value, only return the initializer
            value: undefined
        }) as EnumMemberStructure;
    }
}
