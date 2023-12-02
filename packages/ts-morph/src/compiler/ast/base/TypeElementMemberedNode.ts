import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { CodeBlockWriter } from "../../../codeBlockWriter";
import {
  getEndIndexFromArray,
  insertIntoBracesOrSourceFileWithGetChildren,
  insertIntoBracesOrSourceFileWithGetChildrenWithComments,
} from "../../../manipulation";
import {
  CallSignatureDeclarationStructure,
  ConstructSignatureDeclarationStructure,
  GetAccessorDeclarationStructure,
  IndexSignatureDeclarationStructure,
  MethodSignatureStructure,
  OptionalKind,
  PropertySignatureStructure,
  SetAccessorDeclarationStructure,
  Structure,
  TypeElementMemberedNodeStructure,
  TypeElementMemberStructures,
} from "../../../structures";
import { Constructor, WriterFunction } from "../../../types";
import { getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction } from "../../../utils";
import { TypeElementTypes } from "../aliases";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { GetAccessorDeclaration, SetAccessorDeclaration } from "../class";
import { Node } from "../common";
import {
  CallSignatureDeclaration,
  CommentTypeElement,
  ConstructSignatureDeclaration,
  IndexSignatureDeclaration,
  MethodSignature,
  PropertySignature,
} from "../interface";
import { ExtendedParser } from "../utils";

export type TypeElementMemberedNodeExtensionType = Node<ts.Node & { members: ts.NodeArray<ts.TypeElement> }>;

export interface TypeElementMemberedNode {
  /**
   * Adds a member.
   * @param member - Member to add.
   */
  addMember(member: string | WriterFunction | TypeElementMemberStructures): TypeElementTypes | CommentTypeElement;
  /**
   * Adds members.
   * @param members - Collection of members to add.
   */
  addMembers(
    members: string | WriterFunction | ReadonlyArray<string | WriterFunction | TypeElementMemberStructures>,
  ): (TypeElementTypes | CommentTypeElement)[];
  /**
   * Inserts a member.
   * @param index - Child index to insert at.
   * @param member - Member to insert.
   */
  insertMember(index: number, member: string | WriterFunction | TypeElementMemberStructures): TypeElementTypes | CommentTypeElement;
  /**
   * Inserts members.
   * @param index - Child index to insert at.
   * @param members - Collection of members to insert.
   */
  insertMembers(
    index: number,
    members: string | WriterFunction | ReadonlyArray<string | WriterFunction | TypeElementMemberStructures>,
  ): (TypeElementTypes | CommentTypeElement)[];
  /**
   * Add construct signature.
   * @param structure - Structure representing the construct signature.
   */
  addConstructSignature(structure: OptionalKind<ConstructSignatureDeclarationStructure>): ConstructSignatureDeclaration;
  /**
   * Add construct signatures.
   * @param structures - Structures representing the construct signatures.
   */
  addConstructSignatures(structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>>): ConstructSignatureDeclaration[];
  /**
   * Insert construct signature.
   * @param index - Child index to insert at.
   * @param structure - Structure representing the construct signature.
   */
  insertConstructSignature(index: number, structure: OptionalKind<ConstructSignatureDeclarationStructure>): ConstructSignatureDeclaration;
  /**
   * Insert construct signatures.
   * @param index - Child index to insert at.
   * @param structures - Structures representing the construct signatures.
   */
  insertConstructSignatures(index: number, structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>>): ConstructSignatureDeclaration[];
  /**
   * Gets the first construct signature by a find function.
   * @param findFunction - Function to find the construct signature by.
   */
  getConstructSignature(findFunction: (member: ConstructSignatureDeclaration) => boolean): ConstructSignatureDeclaration | undefined;
  /**
   * Gets the first construct signature by a find function or throws if not found.
   * @param findFunction - Function to find the construct signature by.
   */
  getConstructSignatureOrThrow(findFunction: (member: ConstructSignatureDeclaration) => boolean): ConstructSignatureDeclaration;
  /**
   * Gets the interface construct signatures.
   */
  getConstructSignatures(): ConstructSignatureDeclaration[];

  /**
   * Add call signature.
   * @param structure - Structure representing the call signature.
   */
  addCallSignature(structure: OptionalKind<CallSignatureDeclarationStructure>): CallSignatureDeclaration;
  /**
   * Add call signatures.
   * @param structures - Structures representing the call signatures.
   */
  addCallSignatures(structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>>): CallSignatureDeclaration[];
  /**
   * Insert call signature.
   * @param index - Child index to insert at.
   * @param structure - Structure representing the call signature.
   */
  insertCallSignature(index: number, structure: OptionalKind<CallSignatureDeclarationStructure>): CallSignatureDeclaration;
  /**
   * Insert call signatures.
   * @param index - Child index to insert at.
   * @param structures - Structures representing the call signatures.
   */
  insertCallSignatures(index: number, structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>>): CallSignatureDeclaration[];
  /**
   * Gets the first call signature by a find function.
   * @param findFunction - Function to find the call signature by.
   */
  getCallSignature(findFunction: (member: CallSignatureDeclaration) => boolean): CallSignatureDeclaration | undefined;
  /**
   * Gets the first call signature by a find function or throws if not found.
   * @param findFunction - Function to find the call signature by.
   */
  getCallSignatureOrThrow(findFunction: (member: CallSignatureDeclaration) => boolean): CallSignatureDeclaration;
  /**
   * Gets the interface call signatures.
   */
  getCallSignatures(): CallSignatureDeclaration[];

  /**
   * Add index signature.
   * @param structure - Structure representing the index signature.
   */
  addIndexSignature(structure: OptionalKind<IndexSignatureDeclarationStructure>): IndexSignatureDeclaration;
  /**
   * Add index signatures.
   * @param structures - Structures representing the index signatures.
   */
  addIndexSignatures(structures: ReadonlyArray<OptionalKind<IndexSignatureDeclarationStructure>>): IndexSignatureDeclaration[];
  /**
   * Insert index signature.
   * @param index - Child index to insert at.
   * @param structure - Structure representing the index signature.
   */
  insertIndexSignature(index: number, structure: OptionalKind<IndexSignatureDeclarationStructure>): IndexSignatureDeclaration;
  /**
   * Insert index signatures.
   * @param index - Child index to insert at.
   * @param structures - Structures representing the index signatures.
   */
  insertIndexSignatures(index: number, structures: ReadonlyArray<OptionalKind<IndexSignatureDeclarationStructure>>): IndexSignatureDeclaration[];
  /**
   * Gets the first index signature by a find function.
   * @param findFunction - Function to find the index signature by.
   */
  getIndexSignature(findFunction: (member: IndexSignatureDeclaration) => boolean): IndexSignatureDeclaration | undefined;
  /**
   * Gets the first index signature by a find function or throws if not found.
   * @param findFunction - Function to find the index signature by.
   */
  getIndexSignatureOrThrow(findFunction: (member: IndexSignatureDeclaration) => boolean): IndexSignatureDeclaration;
  /**
   * Gets the interface index signatures.
   */
  getIndexSignatures(): IndexSignatureDeclaration[];

  /**
   * Add method.
   * @param structure - Structure representing the method.
   */
  addMethod(structure: OptionalKind<MethodSignatureStructure>): MethodSignature;
  /**
   * Add methods.
   * @param structures - Structures representing the methods.
   */
  addMethods(structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>>): MethodSignature[];
  /**
   * Insert method.
   * @param index - Child index to insert at.
   * @param structure - Structure representing the method.
   */
  insertMethod(index: number, structure: OptionalKind<MethodSignatureStructure>): MethodSignature;
  /**
   * Insert methods.
   * @param index - Child index to insert at.
   * @param structures - Structures representing the methods.
   */
  insertMethods(index: number, structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>>): MethodSignature[];
  /**
   * Gets the first method by name.
   * @param name - Name.
   */
  getMethod(name: string): MethodSignature | undefined;
  /**
   * Gets the first method by a find function.
   * @param findFunction - Function to find the method by.
   */
  getMethod(findFunction: (member: MethodSignature) => boolean): MethodSignature | undefined;
  /** @internal */
  getMethod(nameOrFindFunction: string | ((member: MethodSignature) => boolean)): MethodSignature | undefined;
  /**
   * Gets the first method by name or throws if not found.
   * @param name - Name.
   */
  getMethodOrThrow(name: string): MethodSignature;
  /**
   * Gets the first method by a find function or throws if not found.
   * @param findFunction - Function to find the method by.
   */
  getMethodOrThrow(findFunction: (member: MethodSignature) => boolean): MethodSignature;
  /**
   * Gets the interface method signatures.
   */
  getMethods(): MethodSignature[];

  /**
   * Add property.
   * @param structure - Structure representing the property.
   */
  addProperty(structure: OptionalKind<PropertySignatureStructure>): PropertySignature;
  /**
   * Add properties.
   * @param structures - Structures representing the properties.
   */
  addProperties(structures: ReadonlyArray<OptionalKind<PropertySignatureStructure>>): PropertySignature[];
  /**
   * Insert property.
   * @param index - Child index to insert at.
   * @param structure - Structure representing the property.
   */
  insertProperty(index: number, structure: OptionalKind<PropertySignatureStructure>): PropertySignature;
  /**
   * Insert properties.
   * @param index - Child index to insert at.
   * @param structures - Structures representing the properties.
   */
  insertProperties(index: number, structures: ReadonlyArray<OptionalKind<PropertySignatureStructure>>): PropertySignature[];
  /**
   * Gets the first property by name.
   * @param name - Name.
   */
  getProperty(name: string): PropertySignature | undefined;
  /**
   * Gets the first property by a find function.
   * @param findFunction - Function to find the property by.
   */
  getProperty(findFunction: (member: PropertySignature) => boolean): PropertySignature | undefined;
  /** @internal */
  getProperty(nameOrFindFunction: string | ((member: PropertySignature) => boolean)): PropertySignature | undefined;
  /**
   * Gets the first property by name or throws if not found.
   * @param name - Name.
   */
  getPropertyOrThrow(name: string): PropertySignature;
  /**
   * Gets the first property by a find function or throws if not found.
   * @param findFunction - Function to find the property by.
   */
  getPropertyOrThrow(findFunction: (member: PropertySignature) => boolean): PropertySignature;
  /**
   * Gets the interface property signatures.
   */
  getProperties(): PropertySignature[];

  /**
   * Add get accessor.
   * @param structure - Structure representing the get accessor.
   */
  addGetAccessor(structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration;
  /**
   * Add get accessors.
   * @param structures - Structures representing the get accessors.
   */
  addGetAccessors(structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[];
  /**
   * Insert get accessor.
   * @param index - Child index to insert at.
   * @param structure - Structure representing the get accessor.
   */
  insertGetAccessor(index: number, structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration;
  /**
   * Insert get accessors.
   * @param index - Child index to insert at.
   * @param structures - Structures representing the get accessors.
   */
  insertGetAccessors(index: number, structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[];
  /**
   * Gets the first get accessor by name.
   * @param name - Name.
   */
  getGetAccessor(name: string): GetAccessorDeclaration | undefined;
  /**
   * Gets the first get accessor by a find function.
   * @param findFunction - Function to find the get accessor by.
   */
  getGetAccessor(findFunction: (member: GetAccessorDeclaration) => boolean): GetAccessorDeclaration | undefined;
  /** @internal */
  getGetAccessor(nameOrFindFunction: string | ((member: GetAccessorDeclaration) => boolean)): GetAccessorDeclaration | undefined;
  /**
   * Gets the first get accessor by name or throws if not found.
   * @param name - Name.
   */
  getGetAccessorOrThrow(name: string): GetAccessorDeclaration;
  /**
   * Gets the first get accessor by a find function or throws if not found.
   * @param findFunction - Function to find the get accessor by.
   */
  getGetAccessorOrThrow(findFunction: (member: GetAccessorDeclaration) => boolean): GetAccessorDeclaration;
  /**
   * Gets the interface get accessor declarations.
   */
  getGetAccessors(): GetAccessorDeclaration[];

  /**
   * Add set accessor.
   * @param structure - Structure representing the set accessor.
   */
  addSetAccessor(structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration;
  /**
   * Add set accessors.
   * @param structures - Structures representing the set accessors.
   */
  addSetAccessors(structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[];
  /**
   * Insert set accessor.
   * @param index - Child index to insert at.
   * @param structure - Structure representing the set accessor.
   */
  insertSetAccessor(index: number, structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration;
  /**
   * Insert set accessors.
   * @param index - Child index to insert at.
   * @param structures - Structures representing the set accessors.
   */
  insertSetAccessors(index: number, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[];
  /**
   * Gets the first set accessor by name.
   * @param name - Name.
   */
  getSetAccessor(name: string): SetAccessorDeclaration | undefined;
  /**
   * Gets the first set accessor by a find function.
   * @param findFunction - Function to find the set accessor by.
   */
  getSetAccessor(findFunction: (member: SetAccessorDeclaration) => boolean): SetAccessorDeclaration | undefined;
  /** @internal */
  getSetAccessor(nameOrFindFunction: string | ((member: SetAccessorDeclaration) => boolean)): SetAccessorDeclaration | undefined;
  /**
   * Gets the first set accessor by name or throws if not found.
   * @param name - Name.
   */
  getSetAccessorOrThrow(name: string): SetAccessorDeclaration;
  /**
   * Gets the first set accessor by a find function or throws if not found.
   * @param findFunction - Function to find the set accessor by.
   */
  getSetAccessorOrThrow(findFunction: (member: SetAccessorDeclaration) => boolean): SetAccessorDeclaration;
  /**
   * Gets the interface set accessor declarations.
   */
  getSetAccessors(): SetAccessorDeclaration[];

  /**
   * Gets all the members.
   */
  getMembers(): TypeElementTypes[];
  /**
   * Gets all the members with comment type elements.
   */
  getMembersWithComments(): (TypeElementTypes | CommentTypeElement)[];
}

export function TypeElementMemberedNode<T extends Constructor<TypeElementMemberedNodeExtensionType>>(Base: T): Constructor<TypeElementMemberedNode> & T {
  return class extends Base implements TypeElementMemberedNode {
    addMember(member: string | WriterFunction | TypeElementMemberStructures): TypeElementTypes | CommentTypeElement {
      return this.addMembers([member])[0];
    }

    addMembers(members: string | WriterFunction | ReadonlyArray<string | WriterFunction | TypeElementMemberStructures>): (
      | TypeElementTypes
      | CommentTypeElement
    )[] {
      return this.insertMembers(getEndIndexFromArray(this.getMembersWithComments()), members);
    }

    insertMember(index: number, member: string | WriterFunction | TypeElementMemberStructures): TypeElementTypes | CommentTypeElement {
      return this.insertMembers(index, [member])[0];
    }

    insertMembers(
      index: number,
      members: string | WriterFunction | ReadonlyArray<string | WriterFunction | TypeElementMemberStructures>,
    ): (TypeElementTypes | CommentTypeElement)[] {
      return insertIntoBracesOrSourceFileWithGetChildrenWithComments({
        getIndexedChildren: () => this.getMembersWithComments(),
        index,
        parent: this,
        write: writer => {
          writer.newLineIfLastNot();

          // create a new writer here because the class member printer will add a blank line in certain cases
          // at the front if it's not on the first line of a block
          const memberWriter = this._getWriter();
          const memberPrinter = this._context.structurePrinterFactory.forTypeElementMember();
          memberPrinter.printTexts(memberWriter, members);
          writer.write(memberWriter.toString());

          writer.newLineIfLastNot();
        },
      }) as (TypeElementTypes | CommentTypeElement)[];
    }

    addConstructSignature(structure: OptionalKind<ConstructSignatureDeclarationStructure>) {
      return this.addConstructSignatures([structure])[0];
    }

    addConstructSignatures(structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>>) {
      return this.insertConstructSignatures(getEndIndexFromArray(this.getMembersWithComments()), structures);
    }

    insertConstructSignature(index: number, structure: OptionalKind<ConstructSignatureDeclarationStructure>) {
      return this.insertConstructSignatures(index, [structure])[0];
    }

    insertConstructSignatures(
      index: number,
      structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>>,
    ): ConstructSignatureDeclaration[] {
      return insertChildren({
        thisNode: this,
        index,
        structures,
        expectedKind: SyntaxKind.ConstructSignature,
        createStructurePrinter: () => this._context.structurePrinterFactory.forConstructSignatureDeclaration(),
      });
    }

    getConstructSignature(findFunction: (member: ConstructSignatureDeclaration) => boolean) {
      return this.getConstructSignatures().find(findFunction);
    }

    getConstructSignatureOrThrow(findFunction: (member: ConstructSignatureDeclaration) => boolean, message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(
        this.getConstructSignature(findFunction),
        message ?? "Expected to find a construct signature with the provided condition.",
        this,
      );
    }

    getConstructSignatures() {
      return this.compilerNode.members.filter(m => m.kind === SyntaxKind.ConstructSignature)
        .map(m => this._getNodeFromCompilerNode(m as ts.ConstructSignatureDeclaration));
    }

    addCallSignature(structure: OptionalKind<CallSignatureDeclarationStructure>) {
      return this.addCallSignatures([structure])[0];
    }

    addCallSignatures(structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>>) {
      return this.insertCallSignatures(getEndIndexFromArray(this.getMembersWithComments()), structures);
    }

    insertCallSignature(index: number, structure: OptionalKind<CallSignatureDeclarationStructure>) {
      return this.insertCallSignatures(index, [structure])[0];
    }

    insertCallSignatures(index: number, structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>>): CallSignatureDeclaration[] {
      return insertChildren({
        thisNode: this,
        index,
        structures,
        expectedKind: SyntaxKind.CallSignature,
        createStructurePrinter: () => this._context.structurePrinterFactory.forCallSignatureDeclaration(),
      });
    }

    getCallSignature(findFunction: (member: CallSignatureDeclaration) => boolean) {
      return this.getCallSignatures().find(findFunction);
    }

    getCallSignatureOrThrow(findFunction: (member: CallSignatureDeclaration) => boolean, message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(
        this.getCallSignature(findFunction),
        message ?? "Expected to find a call signature with the provided condition.",
        this,
      );
    }

    getCallSignatures() {
      return this.compilerNode.members.filter(m => m.kind === SyntaxKind.CallSignature)
        .map(m => this._getNodeFromCompilerNode(m as ts.CallSignatureDeclaration));
    }

    addIndexSignature(structure: OptionalKind<IndexSignatureDeclarationStructure>) {
      return this.addIndexSignatures([structure])[0];
    }

    addIndexSignatures(structures: ReadonlyArray<OptionalKind<IndexSignatureDeclarationStructure>>) {
      return this.insertIndexSignatures(getEndIndexFromArray(this.getMembersWithComments()), structures);
    }

    insertIndexSignature(index: number, structure: OptionalKind<IndexSignatureDeclarationStructure>) {
      return this.insertIndexSignatures(index, [structure])[0];
    }

    insertIndexSignatures(index: number, structures: ReadonlyArray<OptionalKind<IndexSignatureDeclarationStructure>>): IndexSignatureDeclaration[] {
      return insertChildren({
        thisNode: this,
        index,
        structures,
        expectedKind: SyntaxKind.IndexSignature,
        createStructurePrinter: () => this._context.structurePrinterFactory.forIndexSignatureDeclaration(),
      });
    }

    getIndexSignature(findFunction: (member: IndexSignatureDeclaration) => boolean) {
      return this.getIndexSignatures().find(findFunction);
    }

    getIndexSignatureOrThrow(findFunction: (member: IndexSignatureDeclaration) => boolean, message?: string | (() => string)) {
      return errors.throwIfNullOrUndefined(
        this.getIndexSignature(findFunction),
        message ?? "Expected to find a index signature with the provided condition.",
        this,
      );
    }

    getIndexSignatures() {
      return this.compilerNode.members.filter(m => m.kind === SyntaxKind.IndexSignature)
        .map(m => this._getNodeFromCompilerNode(m as ts.IndexSignatureDeclaration));
    }

    addMethod(structure: OptionalKind<MethodSignatureStructure>) {
      return this.addMethods([structure])[0];
    }

    addMethods(structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>>) {
      return this.insertMethods(getEndIndexFromArray(this.getMembersWithComments()), structures);
    }

    insertMethod(index: number, structure: OptionalKind<MethodSignatureStructure>) {
      return this.insertMethods(index, [structure])[0];
    }

    insertMethods(index: number, structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>>): MethodSignature[] {
      return insertChildren({
        thisNode: this,
        index,
        structures,
        expectedKind: SyntaxKind.MethodSignature,
        createStructurePrinter: () => this._context.structurePrinterFactory.forMethodSignature(),
      });
    }

    getMethod(nameOrFindFunction: string | ((member: MethodSignature) => boolean)) {
      return getNodeByNameOrFindFunction(this.getMethods(), nameOrFindFunction);
    }

    getMethodOrThrow(nameOrFindFunction: string | ((member: MethodSignature) => boolean)) {
      return errors.throwIfNullOrUndefined(
        this.getMethod(nameOrFindFunction),
        () => getNotFoundErrorMessageForNameOrFindFunction("interface method signature", nameOrFindFunction),
      );
    }

    getMethods() {
      return this.compilerNode.members.filter(m => m.kind === SyntaxKind.MethodSignature)
        .map(m => this._getNodeFromCompilerNode(m as ts.MethodSignature));
    }

    addProperty(structure: OptionalKind<PropertySignatureStructure>) {
      return this.addProperties([structure])[0];
    }

    addProperties(structures: ReadonlyArray<OptionalKind<PropertySignatureStructure>>) {
      return this.insertProperties(getEndIndexFromArray(this.getMembersWithComments()), structures);
    }

    insertProperty(index: number, structure: OptionalKind<PropertySignatureStructure>) {
      return this.insertProperties(index, [structure])[0];
    }

    insertProperties(index: number, structures: ReadonlyArray<OptionalKind<PropertySignatureStructure>>): PropertySignature[] {
      return insertChildren({
        thisNode: this,
        index,
        structures,
        expectedKind: SyntaxKind.PropertySignature,
        createStructurePrinter: () => this._context.structurePrinterFactory.forPropertySignature(),
      });
    }

    getProperty(nameOrFindFunction: string | ((member: PropertySignature) => boolean)): PropertySignature | undefined {
      return getNodeByNameOrFindFunction(this.getProperties(), nameOrFindFunction);
    }

    getPropertyOrThrow(nameOrFindFunction: string | ((member: PropertySignature) => boolean)): PropertySignature {
      return errors.throwIfNullOrUndefined(
        this.getProperty(nameOrFindFunction),
        () => getNotFoundErrorMessageForNameOrFindFunction("interface property signature", nameOrFindFunction),
      );
    }

    getProperties() {
      return this.compilerNode.members.filter(m => m.kind === SyntaxKind.PropertySignature)
        .map(m => this._getNodeFromCompilerNode(m as ts.PropertySignature));
    }

    addGetAccessor(structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration {
      return this.addGetAccessors([structure])[0];
    }

    addGetAccessors(structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[] {
      const result = [];
      for (const structure of structures) {
        const setAccessor = this.getSetAccessor(structure.name);
        const index = setAccessor == null ? getEndIndexFromArray(this.getMembersWithComments()) : setAccessor.getChildIndex();
        result.push(this.insertGetAccessor(index, structure));
      }
      return result;
    }

    insertGetAccessor(index: number, structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration {
      return this.insertGetAccessors(index, [structure])[0];
    }

    insertGetAccessors(index: number, structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[] {
      return insertChildren({
        thisNode: this,
        index,
        structures,
        expectedKind: SyntaxKind.GetAccessor,
        createStructurePrinter: () =>
          this._context.structurePrinterFactory.forGetAccessorDeclaration({
            isAmbient: true,
          }),
      });
    }

    getGetAccessor(nameOrFindFunction: string | ((member: GetAccessorDeclaration) => boolean)): GetAccessorDeclaration | undefined {
      return getNodeByNameOrFindFunction(this.getGetAccessors(), nameOrFindFunction);
    }

    getGetAccessorOrThrow(nameOrFindFunction: string | ((member: GetAccessorDeclaration) => boolean)): GetAccessorDeclaration {
      return errors.throwIfNullOrUndefined(
        this.getGetAccessor(nameOrFindFunction),
        () => getNotFoundErrorMessageForNameOrFindFunction("interface get accessor", nameOrFindFunction),
      );
    }

    getGetAccessors() {
      return this.compilerNode.members.filter(m => m.kind === SyntaxKind.GetAccessor)
        .map(m => this._getNodeFromCompilerNode(m as ts.GetAccessorDeclaration));
    }

    addSetAccessor(structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration {
      return this.addSetAccessors([structure])[0];
    }

    addSetAccessors(structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[] {
      const result = [];
      for (const structure of structures) {
        const getAccessor = this.getGetAccessor(structure.name);
        const index = getAccessor == null ? getEndIndexFromArray(this.getMembersWithComments()) : getAccessor.getChildIndex() + 1;
        result.push(this.insertSetAccessor(index, structure));
      }
      return result;
    }

    insertSetAccessor(index: number, structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration {
      return this.insertSetAccessors(index, [structure])[0];
    }

    insertSetAccessors(index: number, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[] {
      return insertChildren({
        thisNode: this,
        index,
        structures,
        expectedKind: SyntaxKind.SetAccessor,
        createStructurePrinter: () =>
          this._context.structurePrinterFactory.forSetAccessorDeclaration({
            isAmbient: true,
          }),
      });
    }

    getSetAccessor(nameOrFindFunction: string | ((member: SetAccessorDeclaration) => boolean)): SetAccessorDeclaration | undefined {
      return getNodeByNameOrFindFunction(this.getSetAccessors(), nameOrFindFunction);
    }

    getSetAccessorOrThrow(nameOrFindFunction: string | ((member: SetAccessorDeclaration) => boolean)): SetAccessorDeclaration {
      return errors.throwIfNullOrUndefined(
        this.getSetAccessor(nameOrFindFunction),
        () => getNotFoundErrorMessageForNameOrFindFunction("interface set accessor", nameOrFindFunction),
      );
    }

    getSetAccessors() {
      return this.compilerNode.members.filter(m => m.kind === SyntaxKind.SetAccessor)
        .map(m => this._getNodeFromCompilerNode(m as ts.SetAccessorDeclaration));
    }

    getMembers() {
      return this.compilerNode.members.map(m => this._getNodeFromCompilerNode(m)) as TypeElementTypes[];
    }

    getMembersWithComments() {
      const compilerNode = this.compilerNode as (ts.InterfaceDeclaration | ts.TypeLiteralNode);
      return ExtendedParser.getContainerArray(compilerNode, this._sourceFile.compilerNode)
        .map(m => this._getNodeFromCompilerNode(m)) as (TypeElementTypes | CommentTypeElement)[];
    }

    set(structure: Partial<TypeElementMemberedNodeStructure>) {
      callBaseSet(Base.prototype, this, structure);

      if (structure.callSignatures != null) {
        this.getCallSignatures().forEach(c => c.remove());
        this.addCallSignatures(structure.callSignatures);
      }
      if (structure.constructSignatures != null) {
        this.getConstructSignatures().forEach(c => c.remove());
        this.addConstructSignatures(structure.constructSignatures);
      }
      if (structure.indexSignatures != null) {
        this.getIndexSignatures().forEach(c => c.remove());
        this.addIndexSignatures(structure.indexSignatures);
      }
      if (structure.properties != null) {
        this.getProperties().forEach(c => c.remove());
        this.addProperties(structure.properties);
      }
      if (structure.getAccessors != null) {
        this.getGetAccessors().forEach(c => c.remove());
        this.addGetAccessors(structure.getAccessors);
      }
      if (structure.setAccessors != null) {
        this.getSetAccessors().forEach(c => c.remove());
        this.addSetAccessors(structure.setAccessors);
      }
      if (structure.methods != null) {
        this.getMethods().forEach(c => c.remove());
        this.addMethods(structure.methods);
      }

      return this;
    }

    getStructure() {
      return callBaseGetStructure<TypeElementMemberedNodeStructure>(Base.prototype, this, {
        callSignatures: this.getCallSignatures().map(node => node.getStructure()),
        constructSignatures: this.getConstructSignatures().map(node => node.getStructure()),
        getAccessors: this.getGetAccessors().map(node => node.getStructure()),
        indexSignatures: this.getIndexSignatures().map(node => node.getStructure()),
        methods: this.getMethods().map(node => node.getStructure()),
        properties: this.getProperties().map(node => node.getStructure()),
        setAccessors: this.getSetAccessors().map(node => node.getStructure()),
      });
    }
  };
}

function insertChildren<TNode extends Node, TStructure extends Structure>(opts: {
  thisNode: Node & TypeElementMemberedNode;
  index: number;
  structures: ReadonlyArray<TStructure>;
  expectedKind: SyntaxKind;
  createStructurePrinter: () => { printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<TStructure>): void };
}): TNode[] {
  return insertIntoBracesOrSourceFileWithGetChildren<TNode>({
    getIndexedChildren: () => opts.thisNode.getMembersWithComments(),
    parent: opts.thisNode,
    index: opts.index,
    structures: opts.structures,
    expectedKind: opts.expectedKind,
    write: (writer, info) => {
      writer.newLineIfLastNot();
      opts.createStructurePrinter().printTexts(writer, opts.structures);
      writer.newLineIfLastNot();
    },
  });
}
