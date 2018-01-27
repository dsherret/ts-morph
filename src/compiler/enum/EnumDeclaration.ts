import * as ts from "typescript";
import * as errors from "./../../errors";
import {EnumMemberStructure, EnumDeclarationStructure} from "./../../structures";
import {insertIntoCommaSeparatedNodes, verifyAndGetIndex, removeStatementedNodeChild} from "./../../manipulation";
import {EnumMemberStructureToText} from "./../../structureToTexts";
import {getNamedNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction, TypeGuards} from "./../../utils";
import {callBaseFill} from "./../callBaseFill";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, JSDocableNode, TextInsertableNode, ChildOrderableNode} from "./../base";
import {Node} from "./../common";
import {NamespaceChildableNode} from "./../namespace";
import {EnumMember} from "./EnumMember";

export const EnumDeclarationBase = ChildOrderableNode(TextInsertableNode(NamespaceChildableNode(JSDocableNode(AmbientableNode(ExportableNode(
    ModifierableNode(NamedNode(Node))
))))));
export class EnumDeclaration extends EnumDeclarationBase<ts.EnumDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<EnumDeclarationStructure>) {
        callBaseFill(EnumDeclarationBase.prototype, this, structure);

        if (structure.isConst != null)
            this.setIsConstEnum(structure.isConst);
        if (structure.members != null && structure.members.length > 0)
            this.addMembers(structure.members);

        return this;
    }

    /**
     * Adds a member to the enum.
     * @param structure - Structure of the enum.
     */
    addMember(structure: EnumMemberStructure) {
        return this.addMembers([structure])[0];
    }

    /**
     * Adds members to the enum.
     * @param structures - Structures of the enums.
     */
    addMembers(structures: EnumMemberStructure[]) {
        return this.insertMembers(this.getMembers().length, structures);
    }

    /**
     * Inserts a member to the enum.
     * @param index - Index to insert at.
     * @param structure - Structure of the enum.
     */
    insertMember(index: number, structure: EnumMemberStructure) {
        return this.insertMembers(index, [structure])[0];
    }

    /**
     * Inserts members to an enum.
     * @param index - Index to insert at.
     * @param structures - Structures of the enums.
     */
    insertMembers(index: number, structures: EnumMemberStructure[]) {
        const members = this.getMembers();
        index = verifyAndGetIndex(index, members.length);

        if (structures.length === 0)
            return [];

        // create member code
        const newTexts = structures.map(s => {
            // todo: pass in the StructureToText to the function below
            const writer = this.getWriterWithChildIndentation();
            const structureToText = new EnumMemberStructureToText(writer);
            structureToText.writeText(s);
            return writer.toString();
        });

        // insert
        insertIntoCommaSeparatedNodes({
            parent: this.getChildSyntaxListOrThrow(),
            currentNodes: members,
            insertIndex: index,
            newTexts,
            useNewlines: true
        });

        // get the members
        const newMembers = this.getMembers().slice(index, index + structures.length);
        newMembers.forEach((m, i) => m.fill(structures[i]));
        return newMembers as EnumMember[];
    }

    /**
     * Gets an enum member.
     * @param name - Name of the member.
     */
    getMember(name: string): EnumMember | undefined;
    /**
     * Gets an enum member.
     * @param findFunction - Function to use to find the member.
     */
    getMember(findFunction: (declaration: EnumMember) => boolean): EnumMember | undefined;
    /** @internal */
    getMember(nameOrFindFunction: string | ((declaration: EnumMember) => boolean)): EnumMember | undefined;
    getMember(nameOrFindFunction: string | ((declaration: EnumMember) => boolean)): EnumMember | undefined {
        return getNamedNodeByNameOrFindFunction(this.getMembers(), nameOrFindFunction);
    }

    /**
     * Gets an enum member or throws if not found.
     * @param name - Name of the member.
     */
    getMemberOrThrow(name: string): EnumMember;
    /**
     * Gets an enum member or throws if not found.
     * @param findFunction - Function to use to find the member.
     */
    getMemberOrThrow(findFunction: (declaration: EnumMember) => boolean): EnumMember;
    getMemberOrThrow(nameOrFindFunction: string | ((declaration: EnumMember) => boolean)): EnumMember {
        return errors.throwIfNullOrUndefined(this.getMember(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("enum member", nameOrFindFunction));
    }

    /**
     * Gets the enum's members.
     */
    getMembers() {
        return this.compilerNode.members.map(m => this.getNodeFromCompilerNode(m) as EnumMember);
    }

    /**
     * Toggle if it's a const enum
     */
    setIsConstEnum(value: boolean) {
        return this.toggleModifier("const", value);
    }

    /**
     * Gets if it's a const enum.
     */
    isConstEnum() {
        return this.getConstKeyword() != null;
    }

    /**
     * Gets the const enum keyword or undefined if not exists.
     */
    getConstKeyword() {
        return this.getFirstModifierByKind(ts.SyntaxKind.ConstKeyword);
    }

    /**
     * Removes this enum declaration.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
