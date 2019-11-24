import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { getNodesToReturn, insertIntoCommaSeparatedNodes, verifyAndGetIndex } from "../../../manipulation";
import { EnumDeclarationStructure, EnumMemberStructure, EnumDeclarationSpecificStructure, StructureKind, OptionalKind } from "../../../structures";
import { getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction } from "../../../utils";
import { AmbientableNode, ExportableNode, JSDocableNode, ModifierableNode, NamedNode, TextInsertableNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { NamespaceChildableNode } from "../module";
import { Statement } from "../statement";
import { EnumMember } from "./EnumMember";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { CommentEnumMember } from "./CommentEnumMember";
import { ExtendedParser } from "../utils";
import { WriterFunction } from "../../../types";
import { Node } from "../common";

const createBase = <T extends typeof Statement>(ctor: T) => TextInsertableNode(NamespaceChildableNode(JSDocableNode(
    AmbientableNode(ExportableNode(ModifierableNode(NamedNode(ctor))))
)));
export const EnumDeclarationBase = createBase(Statement);
export class EnumDeclaration extends EnumDeclarationBase<ts.EnumDeclaration> {
    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<EnumDeclarationStructure>) {
        callBaseSet(EnumDeclarationBase.prototype, this, structure);

        if (structure.isConst != null)
            this.setIsConstEnum(structure.isConst);
        if (structure.members != null) {
            this.getMembers().forEach(m => m.remove());
            this.addMembers(structure.members);
        }

        return this;
    }

    /**
     * Adds a member to the enum.
     * @param structure - Structure of the enum.
     */
    addMember(structure: OptionalKind<EnumMemberStructure>): EnumMember;
    /**
     * Adds a member to the enum.
     * @param structure - Structure of the enum.
     */
    addMember(structure: OptionalKind<EnumMemberStructure> | WriterFunction | string): EnumMember | CommentEnumMember;
    addMember(structure: OptionalKind<EnumMemberStructure> | WriterFunction | string) {
        return this.addMembers([structure])[0];
    }

    /**
     * Adds members to the enum.
     * @param structures - Structures of the enums.
     */
    addMembers(structures: ReadonlyArray<OptionalKind<EnumMemberStructure>>): EnumMember[];
    /**
     * Adds members to the enum.
     * @param structures - Structures of the enums.
     */
    addMembers(
        structures: ReadonlyArray<OptionalKind<EnumMemberStructure> | WriterFunction | string> | string | WriterFunction
    ): (EnumMember | CommentEnumMember)[];
    addMembers(structures: ReadonlyArray<OptionalKind<EnumMemberStructure> | WriterFunction>) {
        return this.insertMembers(this.getMembers().length, structures);
    }

    /**
     * Inserts a member to the enum.
     * @param index - Child index to insert at.
     * @param structure - Structure of the enum.
     */
    insertMember(index: number, structure: OptionalKind<EnumMemberStructure>): EnumMember;
    /**
     * Inserts a member to the enum.
     * @param index - Child index to insert at.
     * @param structure - Structure of the enum.
     */
    insertMember(index: number, structure: OptionalKind<EnumMemberStructure> | WriterFunction | string): EnumMember | CommentEnumMember;
    insertMember(index: number, structure: OptionalKind<EnumMemberStructure> | WriterFunction) {
        return this.insertMembers(index, [structure])[0];
    }

    /**
     * Inserts members to an enum.
     * @param index - Child index to insert at.
     * @param structures - Structures of the enums.
     */
    insertMembers(index: number, structures: ReadonlyArray<OptionalKind<EnumMemberStructure>>): EnumMember[];
    /**
     * Inserts members to an enum.
     * @param index - Child index to insert at.
     * @param structures - Structures of the enums.
     */
    insertMembers(
        index: number,
        structures: ReadonlyArray<OptionalKind<EnumMemberStructure> | WriterFunction | string> | WriterFunction | string
    ): (EnumMember | CommentEnumMember)[];
    insertMembers(index: number, structures: ReadonlyArray<OptionalKind<EnumMemberStructure> | WriterFunction | string> | WriterFunction | string) {
        if (structures.length === 0)
            return [];

        const members = this.getMembersWithComments();
        index = verifyAndGetIndex(index, members.length);

        // create member code
        // todo: pass in the StructureToText to the function below
        const writer = this._getWriterWithChildIndentation();
        const structurePrinter = this._context.structurePrinterFactory.forEnumMember();
        structurePrinter.printTexts(writer, structures);

        // insert
        insertIntoCommaSeparatedNodes({
            parent: this.getChildSyntaxListOrThrow(),
            currentNodes: members,
            insertIndex: index,
            newText: writer.toString(),
            useNewLines: true,
            useTrailingCommas: this._context.manipulationSettings.getUseTrailingCommas()
        });

        // get the members
        return getNodesToReturn(members, this.getMembersWithComments(), index, !areAllStructuresStructures());

        function areAllStructuresStructures() {
            // if every item is a structure
            if (!(structures instanceof Array))
                return false;
            return structures.every(s => typeof s === "object");
        }
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
        return getNodeByNameOrFindFunction(this.getMembers(), nameOrFindFunction);
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
    getMembers(): EnumMember[] {
        return this.compilerNode.members.map(m => this._getNodeFromCompilerNode(m));
    }

    /**
     * Gets the enum's members with comment enum members.
     */
    getMembersWithComments(): (EnumMember | CommentEnumMember)[] {
        const compilerNode = this.compilerNode;
        return ExtendedParser.getContainerArray(compilerNode, this.getSourceFile().compilerNode)
            .map(m => this._getNodeFromCompilerNode(m)) as (EnumMember | CommentEnumMember)[];
    }

    /**
     * Toggle if it's a const enum.
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
        return this.getFirstModifierByKind(SyntaxKind.ConstKeyword);
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure() {
        return callBaseGetStructure<EnumDeclarationSpecificStructure>(EnumDeclarationBase.prototype, this, {
            kind: StructureKind.Enum,
            isConst: this.isConstEnum(),
            members: this.getMembers().map(member => member.getStructure())
        }) as EnumDeclarationStructure;
    }
}
