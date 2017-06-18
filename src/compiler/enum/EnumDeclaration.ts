import * as ts from "typescript";
import {EnumMemberStructure} from "./../../structures";
import {insertIntoSyntaxList, verifyAndGetIndex} from "./../../manipulation";
import * as fillClassFuncs from "./../../manipulation/fillClassFunctions";
import {getNamedNodeByNameOrFindFunction} from "./../../utils";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode} from "./../base";
import {EnumMember} from "./EnumMember";

export const EnumDeclarationBase = DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(NamedNode(Node)))));
export class EnumDeclaration extends EnumDeclarationBase<ts.EnumDeclaration> {
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

        const previousMember: EnumMember | undefined = members[index - 1];
        const previousMemberComma = previousMember == null ? undefined : previousMember.getNextSiblingIfKind(ts.SyntaxKind.CommaToken);
        const nextMember: EnumMember | undefined = members[index];
        const indentationText = this.getChildIndentationText();
        const newLineChar = this.factory.getLanguageService().getNewLine();
        const syntaxList = this.getChildSyntaxListOrThrow();
        const syntaxListChildren = syntaxList.getChildren();
        const insertChildIndex = previousMember == null ? 0 : syntaxListChildren.indexOf(previousMemberComma || previousMember) + 1;

        // create member code
        let numberChildren = 1;
        let code = "";
        if (previousMember != null && previousMemberComma == null) {
            code += ",";
            numberChildren++;
        }
        code += `${newLineChar}${getMemberText(structures[0])}`;
        for (const structure of structures.slice(1)) {
            code += `,${newLineChar}${getMemberText(structure)}`;
            numberChildren += 2;
        }
        if (nextMember != null) {
            code += ",";
            numberChildren++;
        }

        function getMemberText(structure: EnumMemberStructure) {
            let memberText = `${indentationText}${structure.name}`;
            if (typeof structure.value !== "undefined")
                memberText += ` = ${structure.value}`;
            return memberText;
        }

        // get the insert position
        let insertPos: number;
        if (previousMember == null)
            insertPos = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken).getEnd();
        else if (previousMemberComma == null)
            insertPos = previousMember.getEnd();
        else
            insertPos = previousMember.getNextSiblingIfKind(ts.SyntaxKind.CommaToken)!.getEnd();

        // insert
        insertIntoSyntaxList(this.getSourceFile(), insertPos, code, syntaxList, insertChildIndex, numberChildren);

        // get the members
        const newMembers = this.getMembers().slice(index, index + structures.length);
        newMembers.forEach((m, i) => fillClassFuncs.fillEnumMemberFromStructure(m, structures[i]));
        return newMembers as EnumMember[];
    }

    /**
     * Gets an enum member.
     * @param name - Name of the member.
     * @param findFunction - Function to use to find the member.
     */
    getMember(name: string): EnumMember | undefined;
    getMember(findFunction: (declaration: EnumMember) => boolean): EnumMember | undefined;
    getMember(nameOrFindFunction: string | ((declaration: EnumMember) => boolean)): EnumMember | undefined {
        return getNamedNodeByNameOrFindFunction(this.getMembers(), nameOrFindFunction);
    }

    /**
     * Gets the enum's members.
     */
    getMembers() {
        return this.getChildSyntaxListOrThrow().getChildren().filter(c => c instanceof EnumMember) as EnumMember[];
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
}
