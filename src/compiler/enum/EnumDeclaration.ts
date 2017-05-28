import * as ts from "typescript";
import {EnumMemberStructure} from "./../../structures";
import {insertIntoSyntaxList, insertStraight, verifyAndGetIndex} from "./../../manipulation";
import {getNamedNodeByNameOrFindFunction} from "./../../utils";
import {SourceFile} from "./../file";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode} from "./../base";
import {EnumMember} from "./EnumMember";

export const EnumDeclarationBase = DocumentationableNode(AmbientableNode(ExportableNode(ModifierableNode(NamedNode(Node)))));
export class EnumDeclaration extends EnumDeclarationBase<ts.EnumDeclaration> {
    /**
     * Adds a member to the enum.
     * @param structure - Structure of the enum.
     * @param sourceFile - Optional source file to help with performance.
     */
    addMember(structure: EnumMemberStructure, sourceFile: SourceFile = this.getSourceFileOrThrow()) {
        return this.addMembers([structure], sourceFile)[0];
    }

    /**
     * Adds members to the enum.
     * @param structures - Structures of the enums.
     * @param sourceFile - Optional source file to help with performance.
     */
    addMembers(structures: EnumMemberStructure[], sourceFile: SourceFile = this.getSourceFileOrThrow()) {
        return this.insertMembers(this.getMembers().length, structures, sourceFile);
    }

    /**
     * Inserts a member to the enum.
     * @param index - Index to insert at.
     * @param structure - Structure of the enum.
     * @param sourceFile - Optional source file to help with performance.
     */
    insertMember(index: number, structure: EnumMemberStructure, sourceFile: SourceFile = this.getSourceFileOrThrow()) {
        return this.insertMembers(index, [structure], sourceFile)[0];
    }

    /**
     * Inserts members to an enum.
     * @param index - Index to insert at.
     * @param structures - Structures of the enums.
     * @param sourceFile - Optional source file to help with performance.
     */
    insertMembers(index: number, structures: EnumMemberStructure[], sourceFile: SourceFile = this.getSourceFileOrThrow()) {
        const members = this.getMembers();
        index = verifyAndGetIndex(index, members.length);

        if (structures.length === 0)
            return [];

        const previousMember: EnumMember | undefined = members[index - 1];
        const previousMemberComma = previousMember == null ? undefined : previousMember.getFollowingComma();
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
            insertPos = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenBraceToken, sourceFile).getEnd();
        else if (previousMemberComma == null)
            insertPos = previousMember.getEnd();
        else
            insertPos = previousMember.getFollowingComma()!.getEnd();

        // insert
        insertIntoSyntaxList(sourceFile, insertPos, code, syntaxList, insertChildIndex, numberChildren);

        // get the members
        const newMembers = this.getMembers();
        return newMembers.slice(index, index + structures.length) as EnumMember[];
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
    setIsConstEnum(value: boolean, sourceFile?: SourceFile) {
        return this.toggleModifier("const", value, sourceFile);
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
