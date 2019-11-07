import { StringUtils, SyntaxKind, ts } from "@ts-morph/common";
import { FormattingKind, removeChildrenWithFormatting } from "../../../manipulation";
import { EnumMemberStructure, EnumMemberSpecificStructure, StructureKind } from "../../../structures";
import { InitializerExpressionableNode, JSDocableNode, PropertyNamedNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { callBaseGetStructure } from "../callBaseGetStructure";

const createBase = <T extends typeof Node>(ctor: T) => JSDocableNode(InitializerExpressionableNode(PropertyNamedNode(ctor)));
export const EnumMemberBase = createBase(Node);
export class EnumMember extends EnumMemberBase<ts.EnumMember> {
    /**
     * Gets the constant value of the enum.
     */
    getValue() {
        return this._context.typeChecker.getConstantValue(this);
    }

    /**
     * Sets the enum value.
     *
     * This is a helper method. Use `#setInitializer` if you want to set the initializer
     * to something other than a string or number.
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
            kind: StructureKind.EnumMember,
            // never return the value, only return the initializer
            value: undefined
        }) as EnumMemberStructure;
    }
}
