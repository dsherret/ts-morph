import { CodeBlockWriter } from "../../../../codeBlockWriter";
import { Constructor } from "../../../../types";
import { errors, ArrayUtils, StringUtils, ts, SyntaxKind } from "@ts-morph/common";
import { getEndIndexFromArray, insertIntoBracesOrSourceFileWithGetChildren, insertIntoParentTextRange, InsertIntoBracesOrSourceFileOptionsWriteInfo,
    insertIntoBracesOrSourceFileWithGetChildrenWithComments } from "../../../../manipulation";
import { ConstructorDeclarationStructure, GetAccessorDeclarationStructure, MethodDeclarationStructure, PropertyDeclarationStructure,
    SetAccessorDeclarationStructure, ClassMemberStructures, OptionalKind, Structure, Structures } from "../../../../structures";
import { WriterFunction } from "../../../../types";
import { getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction, isNodeAmbientOrInAmbientContext } from "../../../../utils";
import { Type } from "../../../types";
import { DecoratableNode, JSDocableNode, ModifierableNode, TypeParameteredNode, ImplementsClauseableNode, TextInsertableNode, HeritageClauseableNode,
    NameableNode } from "../../base";
import { Node } from "../../common";
import { ParameterDeclaration } from "../../function";
import { ExpressionWithTypeArguments } from "../../type";
import { ExtendedParser } from "../../utils";
import { ConstructorDeclaration } from "../ConstructorDeclaration";
import { ClassDeclaration } from "../ClassDeclaration";
import { GetAccessorDeclaration } from "../GetAccessorDeclaration";
import { MethodDeclaration } from "../MethodDeclaration";
import { PropertyDeclaration } from "../PropertyDeclaration";
import { SetAccessorDeclaration } from "../SetAccessorDeclaration";
import { CommentClassElement } from "../CommentClassElement";
import { AbstractableNode } from "./AbstractableNode";

export type ClassPropertyTypes = PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;
export type ClassInstancePropertyTypes = ClassPropertyTypes | ParameterDeclaration;
export type ClassInstanceMemberTypes = MethodDeclaration | ClassInstancePropertyTypes;
export type ClassStaticPropertyTypes = PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;
export type ClassStaticMemberTypes = MethodDeclaration | ClassStaticPropertyTypes;
export type ClassMemberTypes = MethodDeclaration | PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | ConstructorDeclaration;

export type ClassLikeDeclarationBaseExtensionType = Node<ts.ClassLikeDeclarationBase>;

export interface ClassLikeDeclarationBase
    extends NameableNode, TextInsertableNode, ImplementsClauseableNode, HeritageClauseableNode, AbstractableNode, JSDocableNode, TypeParameteredNode,
        DecoratableNode, ModifierableNode, ClassLikeDeclarationBaseSpecific
{
}

export function ClassLikeDeclarationBase<T extends Constructor<ClassLikeDeclarationBaseExtensionType>>(Base: T): Constructor<ClassLikeDeclarationBase> & T {
    return ClassLikeDeclarationBaseSpecific(NameableNode(TextInsertableNode(ImplementsClauseableNode(HeritageClauseableNode(
        AbstractableNode(JSDocableNode(TypeParameteredNode(DecoratableNode(ModifierableNode(Base)))))
    )))));
}

export type ClassLikeDeclarationBaseSpecificExtensionType = Node<ts.ClassLikeDeclarationBase> & HeritageClauseableNode & ModifierableNode & NameableNode;

export interface ClassLikeDeclarationBaseSpecific {
    /**
     * Sets the extends expression.
     * @param text - Text to set as the extends expression.
     */
    setExtends(text: string | WriterFunction): this;
    /**
     * Removes the extends expression, if it exists.
     */
    removeExtends(): this;
    /**
     * Gets the extends expression or throws if it doesn't exist.
     */
    getExtendsOrThrow(): ExpressionWithTypeArguments;
    /**
     * Gets the extends expression or returns undefined if it doesn't exist.
     */
    getExtends(): ExpressionWithTypeArguments | undefined;
    /**
     * Inserts a class member.
     * @param member - Class member to insert.
     */
    addMember(member: string | WriterFunction | ClassMemberStructures): ClassMemberTypes | CommentClassElement;
    /**
     * Inserts class members.
     * @param members - Collection of class members to insert.
     */
    addMembers(members: string | WriterFunction | ReadonlyArray<string | WriterFunction | ClassMemberStructures>): (ClassMemberTypes | CommentClassElement)[];
    /**
     * Inserts a class member.
     * @param index - Child index to insert at.
     * @param member - Class member to insert.
     */
    insertMember(index: number, member: string | WriterFunction | ClassMemberStructures): ClassMemberTypes | CommentClassElement;
    /**
     * Inserts class members.
     * @param index - Child index to insert at.
     * @param members - Collection of class members to insert.
     */
    insertMembers(
        index: number,
        members: string | WriterFunction | ReadonlyArray<string | WriterFunction | ClassMemberStructures>
    ): (ClassMemberTypes | CommentClassElement)[];
    /**
     * Adds a constructor.
     * @param structure - Structure of the constructor.
     */
    addConstructor(structure?: OptionalKind<ConstructorDeclarationStructure>): ConstructorDeclaration;
    /**
     * Adds constructors.
     * @param structures - Structures of the constructor.
     */
    addConstructors(structures: ReadonlyArray<OptionalKind<ConstructorDeclarationStructure>>): ConstructorDeclaration[];
    /**
     * Inserts a constructor.
     * @param index - Child index to insert at.
     * @param structure - Structure of the constructor.
     */
    insertConstructor(index: number, structure?: OptionalKind<ConstructorDeclarationStructure>): ConstructorDeclaration;
    /**
     * Inserts constructors.
     * @param index - Child index to insert at.
     * @param structures - Structures of the constructor.
     */
    insertConstructors(index: number, structures: ReadonlyArray<OptionalKind<ConstructorDeclarationStructure>>): ConstructorDeclaration[];
    /**
     * Gets the constructor declarations.
     */
    getConstructors(): ConstructorDeclaration[];
    /**
     * Add get accessor.
     * @param structure - Structure representing the get accessor.
     */
    addGetAccessor(structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration;
    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addGetAccessors(structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[];
    /**
     * Insert get accessor.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the get accessor.
     */
    insertGetAccessor(index: number, structure: OptionalKind<GetAccessorDeclarationStructure>): GetAccessorDeclaration;
    /**
     * Insert properties.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertGetAccessors(index: number, structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[];
    /**
     * Add set accessor.
     * @param structure - Structure representing the set accessor.
     */
    addSetAccessor(structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration;
    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addSetAccessors(structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[];
    /**
     * Insert set accessor.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the set accessor.
     */
    insertSetAccessor(index: number, structure: OptionalKind<SetAccessorDeclarationStructure>): SetAccessorDeclaration;
    /**
     * Insert properties.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertSetAccessors(index: number, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[];
    /**
     * Add property.
     * @param structure - Structure representing the property.
     */
    addProperty(structure: OptionalKind<PropertyDeclarationStructure>): PropertyDeclaration;
    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addProperties(structures: ReadonlyArray<OptionalKind<PropertyDeclarationStructure>>): PropertyDeclaration[];
    /**
     * Insert property.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the property.
     */
    insertProperty(index: number, structure: OptionalKind<PropertyDeclarationStructure>): PropertyDeclaration;
    /**
     * Insert properties.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertProperties(index: number, structures: ReadonlyArray<OptionalKind<PropertyDeclarationStructure>>): PropertyDeclaration[];
    /**
     * Add method.
     * @param structure - Structure representing the method.
     */
    addMethod(structure: OptionalKind<MethodDeclarationStructure>): MethodDeclaration;
    /**
     * Add methods.
     * @param structures - Structures representing the methods.
     */
    addMethods(structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>>): MethodDeclaration[];
    /**
     * Insert method.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the method.
     */
    insertMethod(index: number, structure: OptionalKind<MethodDeclarationStructure>): MethodDeclaration;
    /**
     * Insert methods.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the methods.
     */
    insertMethods(index: number, structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>>): MethodDeclaration[];
    /**
     * Gets the first instance property by name.
     * @param name - Name.
     */
    getInstanceProperty(name: string): ClassInstancePropertyTypes | undefined;
    /**
     * Gets the first instance property by a find function.
     * @param findFunction - Function to find an instance property by.
     */
    getInstanceProperty(findFunction: (prop: ClassInstancePropertyTypes) => boolean): ClassInstancePropertyTypes | undefined;
    /** @internal */
    getInstanceProperty(nameOrFindFunction: string | ((prop: ClassInstancePropertyTypes) => boolean)): ClassInstancePropertyTypes | undefined;
    /**
     * Gets the first instance property by name or throws if not found.
     * @param name - Name.
     */
    getInstancePropertyOrThrow(name: string): ClassInstancePropertyTypes;
    /**
     * Gets the first instance property by a find function or throws if not found.
     * @param findFunction - Function to find an instance property by.
     */
    getInstancePropertyOrThrow(findFunction: (prop: ClassInstancePropertyTypes) => boolean): ClassInstancePropertyTypes;
    /**
     * Gets the class instance property declarations.
     */
    getInstanceProperties(): ClassInstancePropertyTypes[];
    /**
     * Gets the first static property by name.
     * @param name - Name.
     */
    getStaticProperty(name: string): ClassStaticPropertyTypes | undefined;
    /**
     * Gets the first static property by a find function.
     * @param findFunction - Function to find a static property by.
     */
    getStaticProperty(findFunction: (prop: ClassStaticPropertyTypes) => boolean): ClassStaticPropertyTypes | undefined;
    /** @internal */
    getStaticProperty(nameOrFindFunction: string | ((prop: ClassStaticPropertyTypes) => boolean)): ClassStaticPropertyTypes | undefined;
    /**
     * Gets the first static property by name or throws if not found.
     * @param name - Name.
     */
    getStaticPropertyOrThrow(name: string): ClassStaticPropertyTypes;
    /**
     * Gets the first static property by a find function. or throws if not found.
     * @param findFunction - Function to find a static property by.
     */
    getStaticPropertyOrThrow(findFunction: (prop: ClassStaticPropertyTypes) => boolean): ClassStaticPropertyTypes;
    /**
     * Gets the class instance property declarations.
     */
    getStaticProperties(): ClassStaticPropertyTypes[];
    /**
     * Gets the first property declaration by name.
     * @param name - Name.
     */
    getProperty(name: string): PropertyDeclaration | undefined;
    /**
     * Gets the first property declaration by a find function.
     * @param findFunction - Function to find a property declaration by.
     */
    getProperty(findFunction: (property: PropertyDeclaration) => boolean): PropertyDeclaration | undefined;
    /** @internal */
    getProperty(nameOrFindFunction: string | ((property: PropertyDeclaration) => boolean)): PropertyDeclaration | undefined;
    /**
     * Gets the first property declaration by name or throws if it doesn't exist.
     * @param name - Name.
     */
    getPropertyOrThrow(name: string): PropertyDeclaration;
    /**
     * Gets the first property declaration by a find function or throws if it doesn't exist.
     * @param findFunction - Function to find a property declaration by.
     */
    getPropertyOrThrow(findFunction: (property: PropertyDeclaration) => boolean): PropertyDeclaration;
    /**
     * Gets the class property declarations regardless of whether it's an instance of static property.
     */
    getProperties(): PropertyDeclaration[];
    /**
     * Gets the first get accessor declaration by name.
     * @param name - Name.
     */
    getGetAccessor(name: string): GetAccessorDeclaration | undefined;
    /**
     * Gets the first get accessor declaration by a find function.
     * @param findFunction - Function to find a get accessor declaration by.
     */
    getGetAccessor(findFunction: (getAccessor: GetAccessorDeclaration) => boolean): GetAccessorDeclaration | undefined;
    /** @internal */
    getGetAccessor(nameOrFindFunction: string | ((getAccessor: GetAccessorDeclaration) => boolean)): GetAccessorDeclaration | undefined;
    /**
     * Gets the first get accessor declaration by name or throws if it doesn't exist.
     * @param name - Name.
     */
    getGetAccessorOrThrow(name: string): GetAccessorDeclaration;
    /**
     * Gets the first get accessor declaration by a find function or throws if it doesn't exist.
     * @param findFunction - Function to find a get accessor declaration by.
     */
    getGetAccessorOrThrow(findFunction: (getAccessor: GetAccessorDeclaration) => boolean): GetAccessorDeclaration;
    /**
     * Gets the class get accessor declarations regardless of whether it's an instance of static getAccessor.
     */
    getGetAccessors(): GetAccessorDeclaration[];
    /**
     * Sets the first set accessor declaration by name.
     * @param name - Name.
     */
    getSetAccessor(name: string): SetAccessorDeclaration | undefined;
    /**
     * Sets the first set accessor declaration by a find function.
     * @param findFunction - Function to find a set accessor declaration by.
     */
    getSetAccessor(findFunction: (setAccessor: SetAccessorDeclaration) => boolean): SetAccessorDeclaration | undefined;
    /** @internal */
    getSetAccessor(nameOrFindFunction: string | ((setAccessor: SetAccessorDeclaration) => boolean)): SetAccessorDeclaration | undefined;
    /**
     * Sets the first set accessor declaration by name or throws if it doesn't exist.
     * @param name - Name.
     */
    getSetAccessorOrThrow(name: string): SetAccessorDeclaration;
    /**
     * Sets the first set accessor declaration by a find function or throws if it doesn't exist.
     * @param findFunction - Function to find a set accessor declaration by.
     */
    getSetAccessorOrThrow(findFunction: (setAccessor: SetAccessorDeclaration) => boolean): SetAccessorDeclaration;
    /**
     * Sets the class set accessor declarations regardless of whether it's an instance of static setAccessor.
     */
    getSetAccessors(): SetAccessorDeclaration[];
    /**
     * Gets the first method declaration by name.
     * @param name - Name.
     */
    getMethod(name: string): MethodDeclaration | undefined;
    /**
     * Gets the first method declaration by a find function.
     * @param findFunction - Function to find a method declaration by.
     */
    getMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
    /** @internal */
    getMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined;
    /**
     * Gets the first method declaration by name or throws if it doesn't exist.
     * @param name - Name.
     */
    getMethodOrThrow(name: string): MethodDeclaration;
    /**
     * Gets the first method declaration by a find function or throws if it doesn't exist.
     * @param findFunction - Function to find a method declaration by.
     */
    getMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
    /**
     * Gets the class method declarations regardless of whether it's an instance of static method.
     */
    getMethods(): MethodDeclaration[];
    /**
     * Gets the first instance method by name.
     * @param name - Name.
     */
    getInstanceMethod(name: string): MethodDeclaration | undefined;
    /**
     * Gets the first instance method by a find function.
     * @param findFunction - Function to find an instance method by.
     */
    getInstanceMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
    /** @internal */
    getInstanceMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined;
    /**
     * Gets the first instance method by name or throws if not found.
     * @param name - Name.
     */
    getInstanceMethodOrThrow(name: string): MethodDeclaration;
    /**
     * Gets the first instance method by a find function. or throws if not found.
     * @param findFunction - Function to find an instance method by.
     */
    getInstanceMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
    /**
     * Gets the class instance method declarations.
     */
    getInstanceMethods(): MethodDeclaration[];
    /**
     * Gets the first static method by name.
     * @param name - Name.
     */
    getStaticMethod(name: string): MethodDeclaration | undefined;
    /**
     * Gets the first static method by a find function.
     * @param findFunction - Function to find a static method by.
     */
    getStaticMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
    /** @internal */
    getStaticMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined;
    /**
     * Gets the first static method by name or throws if not found.
     * @param name - Name.
     */
    getStaticMethodOrThrow(name: string): MethodDeclaration;
    /**
     * Gets the first static method by a find function. or throws if not found.
     * @param findFunction - Function to find a static method by.
     */
    getStaticMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
    /**
     * Gets the class instance method declarations.
     */
    getStaticMethods(): MethodDeclaration[];
    /**
     * Gets the first instance member by name.
     * @param name - Name.
     */
    getInstanceMember(name: string): ClassInstanceMemberTypes | undefined;
    /**
     * Gets the first instance member by a find function.
     * @param findFunction - Function to find the instance member by.
     */
    getInstanceMember(findFunction: (member: ClassInstanceMemberTypes) => boolean): ClassInstanceMemberTypes | undefined;
    /** @internal */
    getInstanceMember(nameOrFindFunction: string | ((member: ClassInstanceMemberTypes) => boolean)): ClassInstanceMemberTypes | undefined;
    /**
     * Gets the first instance member by name or throws if not found.
     * @param name - Name.
     */
    getInstanceMemberOrThrow(name: string): ClassInstanceMemberTypes;
    /**
     * Gets the first instance member by a find function. or throws if not found.
     * @param findFunction - Function to find the instance member by.
     */
    getInstanceMemberOrThrow(findFunction: (member: ClassInstanceMemberTypes) => boolean): ClassInstanceMemberTypes;
    /**
     * Gets the instance members.
     */
    getInstanceMembers(): ClassInstanceMemberTypes[];
    /**
     * Gets the first static member by name.
     * @param name - Name.
     */
    getStaticMember(name: string): ClassStaticMemberTypes | undefined;
    /**
     * Gets the first static member by a find function.
     * @param findFunction - Function to find an static method by.
     */
    getStaticMember(findFunction: (member: ClassStaticMemberTypes) => boolean): ClassStaticMemberTypes | undefined;
    /** @internal */
    getStaticMember(nameOrFindFunction: string | ((member: ClassStaticMemberTypes) => boolean)): ClassStaticMemberTypes | undefined;
    /**
     * Gets the first static member by name or throws if not found.
     * @param name - Name.
     */
    getStaticMemberOrThrow(name: string): ClassStaticMemberTypes;
    /**
     * Gets the first static member by a find function. or throws if not found.
     * @param findFunction - Function to find an static method by.
     */
    getStaticMemberOrThrow(findFunction: (member: ClassStaticMemberTypes) => boolean): ClassStaticMemberTypes;
    /**
     * Gets the static members.
     */
    getStaticMembers(): ClassStaticMemberTypes[];
    /**
     * Gets the class members regardless of whether an instance of static member with parameter properties.
     * @internal
     */
    getMembersWithParameterProperties(): (ClassMemberTypes | ParameterDeclaration)[];
    /**
     * Gets the class' members regardless of whether it's an instance of static member.
     */
    getMembers(): ClassMemberTypes[];
    /**
     * Gets the class' members with comment class elements.
     */
    getMembersWithComments(): (ClassMemberTypes | CommentClassElement)[];
    /**
     * Gets the first member by name.
     * @param name - Name.
     */
    getMember(name: string): ClassMemberTypes | undefined;
    /**
     * Gets the first member by a find function.
     * @param findFunction - Function to find an method by.
     */
    getMember(findFunction: (member: ClassMemberTypes) => boolean): ClassMemberTypes | undefined;
    /** @internal */
    getMember(nameOrFindFunction: string | ((member: ClassMemberTypes) => boolean)): ClassMemberTypes | undefined;
    /**
     * Gets the first member by name or throws if not found.
     * @param name - Name.
     */
    getMemberOrThrow(name: string): ClassMemberTypes;
    /**
     * Gets the first member by a find function. or throws if not found.
     * @param findFunction - Function to find an method by.
     */
    getMemberOrThrow(findFunction: (member: ClassMemberTypes) => boolean): ClassMemberTypes;
    /**
     * Gets the base types.
     *
     * This is useful to use if the base could possibly be a mixin.
     */
    getBaseTypes(): Type[];
    /**
     * Gets the base class or throws.
     *
     * Note: Use getBaseTypes if you need to get the mixins.
     */
    getBaseClassOrThrow(): ClassDeclaration;
    /**
     * Gets the base class.
     *
     * Note: Use getBaseTypes if you need to get the mixins.
     */
    getBaseClass(): ClassDeclaration | undefined;
    /**
     * Gets all the derived classes.
     */
    getDerivedClasses(): ClassDeclaration[];
}

export function ClassLikeDeclarationBaseSpecific<T extends Constructor<ClassLikeDeclarationBaseSpecificExtensionType>>(
    Base: T
): Constructor<ClassLikeDeclarationBaseSpecific> & T {
    return class extends Base implements ClassLikeDeclarationBaseSpecific {
        setExtends(text: string | WriterFunction) {
            text = this._getTextWithQueuedChildIndentation(text);

            if (StringUtils.isNullOrWhitespace(text))
                return this.removeExtends();

            const extendsClause = this.getHeritageClauseByKind(SyntaxKind.ExtendsKeyword);

            if (extendsClause != null) {
                const childSyntaxList = extendsClause.getFirstChildByKindOrThrow(SyntaxKind.SyntaxList);
                const childSyntaxListStart = childSyntaxList.getStart();
                insertIntoParentTextRange({
                    parent: extendsClause,
                    newText: text,
                    insertPos: childSyntaxListStart,
                    replacing: {
                        textLength: childSyntaxList.getEnd() - childSyntaxListStart
                    }
                });
            }
            else {
                const implementsClause = this.getHeritageClauseByKind(SyntaxKind.ImplementsKeyword);
                let insertPos: number;
                if (implementsClause != null)
                    insertPos = implementsClause.getStart();
                else
                    insertPos = this.getFirstChildByKindOrThrow(SyntaxKind.OpenBraceToken).getStart();

                const isLastSpace = /\s/.test(this.getSourceFile().getFullText()[insertPos - 1]);
                let newText = `extends ${text} `;
                if (!isLastSpace)
                    newText = " " + newText;

                insertIntoParentTextRange({
                    parent: implementsClause == null ? this : implementsClause.getParentSyntaxListOrThrow(),
                    insertPos,
                    newText
                });
            }

            return this;
        }

        removeExtends() {
            const extendsClause = this.getHeritageClauseByKind(SyntaxKind.ExtendsKeyword);
            if (extendsClause == null)
                return this;
            extendsClause.removeExpression(0);
            return this;
        }

        getExtendsOrThrow() {
            return errors.throwIfNullOrUndefined(this.getExtends(), `Expected to find the extends expression for the class ${this.getName()}.`);
        }

        getExtends(): ExpressionWithTypeArguments | undefined {
            const extendsClause = this.getHeritageClauseByKind(SyntaxKind.ExtendsKeyword);
            if (extendsClause == null)
                return undefined;

            const types = extendsClause.getTypeNodes();
            return types.length === 0 ? undefined : types[0];
        }

        addMembers(members: string | WriterFunction | ReadonlyArray<string | WriterFunction | ClassMemberStructures>) {
            return this.insertMembers(getEndIndexFromArray(this.getMembersWithComments()), members);
        }

        addMember(member: string | WriterFunction | ClassMemberStructures) {
            return this.insertMember(getEndIndexFromArray(this.getMembersWithComments()), member);
        }

        insertMember(index: number, member: string | WriterFunction | ClassMemberStructures) {
            return this.insertMembers(index, [member])[0];
        }

        insertMembers(
            index: number,
            members: string | WriterFunction | ReadonlyArray<string | WriterFunction | ClassMemberStructures>
        ): (ClassMemberTypes | CommentClassElement)[] {
            const isAmbient = isNodeAmbientOrInAmbientContext(this);
            return insertIntoBracesOrSourceFileWithGetChildrenWithComments({
                getIndexedChildren: () => this.getMembersWithComments(),
                index,
                parent: this,
                write: (writer, info) => {
                    const previousMemberHasBody = !isAmbient && info.previousMember != null && Node.isBodyableNode(info.previousMember)
                        && info.previousMember.hasBody();
                    const firstStructureHasBody = !isAmbient && members instanceof Array && structureHasBody(members[0]);

                    if (previousMemberHasBody || info.previousMember != null && firstStructureHasBody)
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();

                    // create a new writer here because the class member printer will add a blank line in certain cases
                    // at the front if it's not on the first line of a block
                    const memberWriter = this._getWriter();
                    const memberPrinter = this._context.structurePrinterFactory.forClassMember({ isAmbient });
                    memberPrinter.printTexts(memberWriter, members);
                    writer.write(memberWriter.toString());

                    const lastStructureHasBody = !isAmbient && members instanceof Array && structureHasBody(members[members.length - 1]);
                    const nextMemberHasBody = !isAmbient && info.nextMember != null && Node.isBodyableNode(info.nextMember) && info.nextMember.hasBody();

                    if (info.nextMember != null && lastStructureHasBody || nextMemberHasBody)
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();
                }
            }) as (ClassMemberTypes | CommentClassElement)[];

            function structureHasBody(value: unknown) {
                if (isAmbient || value == null || typeof (value as any).kind !== "number")
                    return false;

                const structure = value as Structures;
                return Structure.isMethod(structure)
                    || Structure.isGetAccessor(structure)
                    || Structure.isSetAccessor(structure)
                    || Structure.isConstructor(structure);
            }
        }

        addConstructor(structure: OptionalKind<ConstructorDeclarationStructure> = {}) {
            return this.insertConstructor(getEndIndexFromArray(this.getMembersWithComments()), structure);
        }

        addConstructors(structures: ReadonlyArray<OptionalKind<ConstructorDeclarationStructure>>) {
            return this.insertConstructors(getEndIndexFromArray(this.getMembersWithComments()), structures);
        }

        insertConstructor(index: number, structure: OptionalKind<ConstructorDeclarationStructure> = {}) {
            return this.insertConstructors(index, [structure])[0];
        }

        insertConstructors(index: number, structures: ReadonlyArray<OptionalKind<ConstructorDeclarationStructure>>): ConstructorDeclaration[] {
            const isAmbient = isNodeAmbientOrInAmbientContext(this);

            return insertChildren<ConstructorDeclaration>(this, {
                index,
                structures,
                expectedKind: SyntaxKind.Constructor,
                write: (writer, info) => {
                    if (!isAmbient && info.previousMember != null)
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();
                    this._context.structurePrinterFactory.forConstructorDeclaration({ isAmbient }).printTexts(writer, structures);
                    if (!isAmbient && info.nextMember != null)
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();
                }
            });
        }

        getConstructors() {
            return this.getMembers().filter(m => Node.isConstructorDeclaration(m)) as ConstructorDeclaration[];
        }

        addGetAccessor(structure: OptionalKind<GetAccessorDeclarationStructure>) {
            return this.addGetAccessors([structure])[0];
        }

        addGetAccessors(structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>) {
            return this.insertGetAccessors(getEndIndexFromArray(this.getMembersWithComments()), structures);
        }

        insertGetAccessor(index: number, structure: OptionalKind<GetAccessorDeclarationStructure>) {
            return this.insertGetAccessors(index, [structure])[0];
        }

        insertGetAccessors(index: number, structures: ReadonlyArray<OptionalKind<GetAccessorDeclarationStructure>>): GetAccessorDeclaration[] {
            return insertChildren<GetAccessorDeclaration>(this, {
                index,
                structures,
                expectedKind: SyntaxKind.GetAccessor,
                write: (writer, info) => {
                    if (info.previousMember != null)
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();

                    this._context.structurePrinterFactory.forGetAccessorDeclaration({
                        isAmbient: isNodeAmbientOrInAmbientContext(this)
                    }).printTexts(writer, structures);

                    if (info.nextMember != null)
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();
                }
            });
        }

        addSetAccessor(structure: OptionalKind<SetAccessorDeclarationStructure>) {
            return this.addSetAccessors([structure])[0];
        }

        addSetAccessors(structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>) {
            return this.insertSetAccessors(getEndIndexFromArray(this.getMembersWithComments()), structures);
        }

        insertSetAccessor(index: number, structure: OptionalKind<SetAccessorDeclarationStructure>) {
            return this.insertSetAccessors(index, [structure])[0];
        }

        insertSetAccessors(index: number, structures: ReadonlyArray<OptionalKind<SetAccessorDeclarationStructure>>): SetAccessorDeclaration[] {
            return insertChildren<SetAccessorDeclaration>(this, {
                index,
                structures,
                expectedKind: SyntaxKind.SetAccessor,
                write: (writer, info) => {
                    if (info.previousMember != null)
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();

                    this._context.structurePrinterFactory.forSetAccessorDeclaration({
                        isAmbient: isNodeAmbientOrInAmbientContext(this)
                    }).printTexts(writer, structures);

                    if (info.nextMember != null)
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();
                }
            });
        }

        addProperty(structure: OptionalKind<PropertyDeclarationStructure>) {
            return this.addProperties([structure])[0];
        }

        addProperties(structures: ReadonlyArray<OptionalKind<PropertyDeclarationStructure>>) {
            return this.insertProperties(getEndIndexFromArray(this.getMembersWithComments()), structures);
        }

        insertProperty(index: number, structure: OptionalKind<PropertyDeclarationStructure>) {
            return this.insertProperties(index, [structure])[0];
        }

        insertProperties(index: number, structures: ReadonlyArray<OptionalKind<PropertyDeclarationStructure>>): PropertyDeclaration[] {
            return insertChildren<PropertyDeclaration>(this, {
                index,
                structures,
                expectedKind: SyntaxKind.PropertyDeclaration,
                write: (writer, info) => {
                    if (info.previousMember != null && Node.hasBody(info.previousMember))
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();
                    this._context.structurePrinterFactory.forPropertyDeclaration().printTexts(writer, structures);
                    if (info.nextMember != null && Node.hasBody(info.nextMember))
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();
                }
            });
        }

        addMethod(structure: OptionalKind<MethodDeclarationStructure>) {
            return this.addMethods([structure])[0];
        }

        addMethods(structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>>) {
            return this.insertMethods(getEndIndexFromArray(this.getMembersWithComments()), structures);
        }

        insertMethod(index: number, structure: OptionalKind<MethodDeclarationStructure>) {
            return this.insertMethods(index, [structure])[0];
        }

        insertMethods(index: number, structures: ReadonlyArray<OptionalKind<MethodDeclarationStructure>>): MethodDeclaration[] {
            const isAmbient = isNodeAmbientOrInAmbientContext(this);
            structures = structures.map(s => ({ ...s }));

            // insert, fill, and get created nodes
            return insertChildren<MethodDeclaration>(this, {
                index,
                write: (writer, info) => {
                    if (!isAmbient && info.previousMember != null)
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();
                    this._context.structurePrinterFactory.forMethodDeclaration({ isAmbient }).printTexts(writer, structures);
                    if (!isAmbient && info.nextMember != null)
                        writer.blankLineIfLastNot();
                    else
                        writer.newLineIfLastNot();
                },
                structures,
                expectedKind: SyntaxKind.MethodDeclaration
            });
        }

        getInstanceProperty(name: string): ClassInstancePropertyTypes | undefined;
        getInstanceProperty(findFunction: (prop: ClassInstancePropertyTypes) => boolean): ClassInstancePropertyTypes | undefined;
        getInstanceProperty(nameOrFindFunction: string | ((prop: ClassInstancePropertyTypes) => boolean)): ClassInstancePropertyTypes | undefined;
        getInstanceProperty(nameOrFindFunction: string | ((prop: ClassInstancePropertyTypes) => boolean)): ClassInstancePropertyTypes | undefined {
            return getNodeByNameOrFindFunction(this.getInstanceProperties(), nameOrFindFunction);
        }

        getInstancePropertyOrThrow(name: string): ClassInstancePropertyTypes;
        getInstancePropertyOrThrow(findFunction: (prop: ClassInstancePropertyTypes) => boolean): ClassInstancePropertyTypes;
        getInstancePropertyOrThrow(nameOrFindFunction: string | ((prop: ClassInstancePropertyTypes) => boolean)): ClassInstancePropertyTypes {
            return errors.throwIfNullOrUndefined(this.getInstanceProperty(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class instance property", nameOrFindFunction));
        }

        getInstanceProperties(): ClassInstancePropertyTypes[] {
            return this.getInstanceMembers()
                .filter(m => isClassPropertyType(m)) as ClassInstancePropertyTypes[];
        }

        getStaticProperty(name: string): ClassStaticPropertyTypes | undefined;
        getStaticProperty(findFunction: (prop: ClassStaticPropertyTypes) => boolean): ClassStaticPropertyTypes | undefined;
        getStaticProperty(nameOrFindFunction: string | ((prop: ClassStaticPropertyTypes) => boolean)): ClassStaticPropertyTypes | undefined;
        getStaticProperty(nameOrFindFunction: string | ((prop: ClassStaticPropertyTypes) => boolean)): ClassStaticPropertyTypes | undefined {
            return getNodeByNameOrFindFunction(this.getStaticProperties(), nameOrFindFunction);
        }

        getStaticPropertyOrThrow(name: string): ClassStaticPropertyTypes;
        getStaticPropertyOrThrow(findFunction: (prop: ClassStaticPropertyTypes) => boolean): ClassStaticPropertyTypes;
        getStaticPropertyOrThrow(nameOrFindFunction: string | ((prop: ClassStaticPropertyTypes) => boolean)): ClassStaticPropertyTypes {
            return errors.throwIfNullOrUndefined(this.getStaticProperty(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class static property", nameOrFindFunction));
        }

        getStaticProperties(): ClassStaticPropertyTypes[] {
            return this.getStaticMembers()
                .filter(m => isClassPropertyType(m)) as ClassStaticPropertyTypes[];
        }

        getProperty(name: string): PropertyDeclaration | undefined;
        getProperty(findFunction: (property: PropertyDeclaration) => boolean): PropertyDeclaration | undefined;
        getProperty(nameOrFindFunction: string | ((property: PropertyDeclaration) => boolean)): PropertyDeclaration | undefined;
        getProperty(nameOrFindFunction: string | ((property: PropertyDeclaration) => boolean)): PropertyDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getProperties(), nameOrFindFunction);
        }

        getPropertyOrThrow(name: string): PropertyDeclaration;
        getPropertyOrThrow(findFunction: (property: PropertyDeclaration) => boolean): PropertyDeclaration;
        getPropertyOrThrow(nameOrFindFunction: string | ((property: PropertyDeclaration) => boolean)): PropertyDeclaration {
            return errors.throwIfNullOrUndefined(this.getProperty(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class property declaration", nameOrFindFunction));
        }

        getProperties() {
            return this.getMembers()
                .filter(m => Node.isPropertyDeclaration(m)) as PropertyDeclaration[];
        }

        getGetAccessor(name: string): GetAccessorDeclaration | undefined;
        getGetAccessor(findFunction: (getAccessor: GetAccessorDeclaration) => boolean): GetAccessorDeclaration | undefined;
        getGetAccessor(nameOrFindFunction: string | ((getAccessor: GetAccessorDeclaration) => boolean)): GetAccessorDeclaration | undefined;
        getGetAccessor(nameOrFindFunction: string | ((getAccessor: GetAccessorDeclaration) => boolean)): GetAccessorDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getGetAccessors(), nameOrFindFunction);
        }

        getGetAccessorOrThrow(name: string): GetAccessorDeclaration;
        getGetAccessorOrThrow(findFunction: (getAccessor: GetAccessorDeclaration) => boolean): GetAccessorDeclaration;
        getGetAccessorOrThrow(nameOrFindFunction: string | ((getAccessor: GetAccessorDeclaration) => boolean)): GetAccessorDeclaration {
            return errors.throwIfNullOrUndefined(this.getGetAccessor(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class getAccessor declaration", nameOrFindFunction));
        }

        getGetAccessors() {
            return this.getMembers()
                .filter(m => Node.isGetAccessorDeclaration(m)) as GetAccessorDeclaration[];
        }

        getSetAccessor(name: string): SetAccessorDeclaration | undefined;
        getSetAccessor(findFunction: (setAccessor: SetAccessorDeclaration) => boolean): SetAccessorDeclaration | undefined;
        getSetAccessor(nameOrFindFunction: string | ((setAccessor: SetAccessorDeclaration) => boolean)): SetAccessorDeclaration | undefined;
        getSetAccessor(nameOrFindFunction: string | ((setAccessor: SetAccessorDeclaration) => boolean)): SetAccessorDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getSetAccessors(), nameOrFindFunction);
        }

        getSetAccessorOrThrow(name: string): SetAccessorDeclaration;
        getSetAccessorOrThrow(findFunction: (setAccessor: SetAccessorDeclaration) => boolean): SetAccessorDeclaration;
        getSetAccessorOrThrow(nameOrFindFunction: string | ((setAccessor: SetAccessorDeclaration) => boolean)): SetAccessorDeclaration {
            return errors.throwIfNullOrUndefined(this.getSetAccessor(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class setAccessor declaration", nameOrFindFunction));
        }

        getSetAccessors() {
            return this.getMembers()
                .filter(m => Node.isSetAccessorDeclaration(m)) as SetAccessorDeclaration[];
        }

        getMethod(name: string): MethodDeclaration | undefined;
        getMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
        getMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined;
        getMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getMethods(), nameOrFindFunction);
        }

        getMethodOrThrow(name: string): MethodDeclaration;
        getMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
        getMethodOrThrow(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration {
            return errors.throwIfNullOrUndefined(this.getMethod(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class method declaration", nameOrFindFunction));
        }

        getMethods() {
            return this.getMembers()
                .filter(m => Node.isMethodDeclaration(m)) as MethodDeclaration[];
        }

        getInstanceMethod(name: string): MethodDeclaration | undefined;
        getInstanceMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
        getInstanceMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined;
        getInstanceMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getInstanceMethods(), nameOrFindFunction);
        }

        getInstanceMethodOrThrow(name: string): MethodDeclaration;
        getInstanceMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
        getInstanceMethodOrThrow(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration {
            return errors.throwIfNullOrUndefined(this.getInstanceMethod(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class instance method", nameOrFindFunction));
        }

        getInstanceMethods(): MethodDeclaration[] {
            return this.getInstanceMembers().filter(m => m instanceof MethodDeclaration) as MethodDeclaration[];
        }

        getStaticMethod(name: string): MethodDeclaration | undefined;
        getStaticMethod(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration | undefined;
        getStaticMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined;
        getStaticMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getStaticMethods(), nameOrFindFunction);
        }

        getStaticMethodOrThrow(name: string): MethodDeclaration;
        getStaticMethodOrThrow(findFunction: (method: MethodDeclaration) => boolean): MethodDeclaration;
        getStaticMethodOrThrow(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration {
            return errors.throwIfNullOrUndefined(this.getStaticMethod(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class static method", nameOrFindFunction));
        }

        getStaticMethods(): MethodDeclaration[] {
            return this.getStaticMembers().filter(m => m instanceof MethodDeclaration) as MethodDeclaration[];
        }

        getInstanceMember(name: string): ClassInstanceMemberTypes | undefined;
        getInstanceMember(findFunction: (member: ClassInstanceMemberTypes) => boolean): ClassInstanceMemberTypes | undefined;
        getInstanceMember(nameOrFindFunction: string | ((member: ClassInstanceMemberTypes) => boolean)): ClassInstanceMemberTypes | undefined;
        getInstanceMember(nameOrFindFunction: string | ((member: ClassInstanceMemberTypes) => boolean)): ClassInstanceMemberTypes | undefined {
            return getNodeByNameOrFindFunction(this.getInstanceMembers(), nameOrFindFunction);
        }

        getInstanceMemberOrThrow(name: string): ClassInstanceMemberTypes;
        getInstanceMemberOrThrow(findFunction: (member: ClassInstanceMemberTypes) => boolean): ClassInstanceMemberTypes;
        getInstanceMemberOrThrow(nameOrFindFunction: string | ((member: ClassInstanceMemberTypes) => boolean)): ClassInstanceMemberTypes {
            return errors.throwIfNullOrUndefined(this.getInstanceMember(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class instance member", nameOrFindFunction));
        }

        getInstanceMembers() {
            return this.getMembersWithParameterProperties().filter(m => {
                if (Node.isConstructorDeclaration(m))
                    return false;
                return Node.isParameterDeclaration(m) || !m.isStatic();
            }) as ClassInstanceMemberTypes[];
        }

        getStaticMember(name: string): ClassStaticMemberTypes | undefined;
        getStaticMember(findFunction: (member: ClassStaticMemberTypes) => boolean): ClassStaticMemberTypes | undefined;
        getStaticMember(nameOrFindFunction: string | ((member: ClassStaticMemberTypes) => boolean)): ClassStaticMemberTypes | undefined;
        getStaticMember(nameOrFindFunction: string | ((member: ClassStaticMemberTypes) => boolean)): ClassStaticMemberTypes | undefined {
            return getNodeByNameOrFindFunction(this.getStaticMembers(), nameOrFindFunction);
        }

        getStaticMemberOrThrow(name: string): ClassStaticMemberTypes;
        getStaticMemberOrThrow(findFunction: (member: ClassStaticMemberTypes) => boolean): ClassStaticMemberTypes;
        getStaticMemberOrThrow(nameOrFindFunction: string | ((member: ClassStaticMemberTypes) => boolean)): ClassStaticMemberTypes {
            return errors.throwIfNullOrUndefined(this.getStaticMember(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class static member", nameOrFindFunction));
        }

        getStaticMembers() {
            return this.getMembers().filter(m => {
                if (Node.isConstructorDeclaration(m))
                    return false;
                return !Node.isParameterDeclaration(m) && m.isStatic();
            }) as ClassStaticMemberTypes[];
        }

        getMembersWithParameterProperties() {
            const members: (ClassMemberTypes | ParameterDeclaration)[] = this.getMembers();
            const implementationCtors = members.filter(c => Node.isConstructorDeclaration(c) && c.isImplementation()) as ConstructorDeclaration[];
            for (const ctor of implementationCtors) {
                // insert after the constructor
                let insertIndex = members.indexOf(ctor) + 1;
                for (const param of ctor.getParameters()) {
                    if (param.isParameterProperty()) {
                        members.splice(insertIndex, 0, param);
                        insertIndex++;
                    }
                }
            }

            return members;
        }

        getMembers() {
            return getAllMembers(this, this.compilerNode.members).filter(m => isSupportedClassMember(m)) as ClassMemberTypes[];
        }

        getMembersWithComments() {
            const compilerNode = this.compilerNode as ts.ClassExpression | ts.ClassDeclaration;
            const members = ExtendedParser.getContainerArray(compilerNode, this.getSourceFile().compilerNode);
            return getAllMembers(this, members)
                .filter(m => isSupportedClassMember(m) || Node.isCommentClassElement(m)) as (ClassMemberTypes | CommentClassElement)[];
        }

        getMember(name: string): ClassMemberTypes | undefined;
        getMember(findFunction: (member: ClassMemberTypes) => boolean): ClassMemberTypes | undefined;
        getMember(nameOrFindFunction: string | ((member: ClassMemberTypes) => boolean)): ClassMemberTypes | undefined;
        getMember(nameOrFindFunction: string | ((member: ClassMemberTypes) => boolean)): ClassMemberTypes | undefined {
            return getNodeByNameOrFindFunction(this.getMembers(), nameOrFindFunction);
        }

        getMemberOrThrow(name: string): ClassMemberTypes;
        getMemberOrThrow(findFunction: (member: ClassMemberTypes) => boolean): ClassMemberTypes;
        getMemberOrThrow(nameOrFindFunction: string | ((member: ClassMemberTypes) => boolean)): ClassMemberTypes {
            return errors.throwIfNullOrUndefined(
                this.getMember(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class member", nameOrFindFunction)
            );
        }

        getBaseTypes(): Type[] {
            return this.getType().getBaseTypes();
        }

        getBaseClassOrThrow() {
            return errors.throwIfNullOrUndefined(this.getBaseClass(), `Expected to find the base class of ${this.getName()}.`);
        }

        getBaseClass() {
            const baseTypes = ArrayUtils.flatten(this.getBaseTypes().map(t => t.isIntersection() ? t.getIntersectionTypes() : [t]));
            const declarations = baseTypes
                .map(t => t.getSymbol())
                .filter(s => s != null)
                .map(s => s!.getDeclarations())
                .reduce((a, b) => a.concat(b), [])
                .filter(d => d.getKind() === SyntaxKind.ClassDeclaration);
            if (declarations.length !== 1)
                return undefined;
            return declarations[0] as ClassDeclaration;
        }

        getDerivedClasses() {
            const classes = getImmediateDerivedClasses(this);

            for (let i = 0; i < classes.length; i++) {
                const derivedClasses = getImmediateDerivedClasses(classes[i]);
                for (const derivedClass of derivedClasses) {
                    // don't allow circular references
                    if (derivedClass !== (this as ClassLikeDeclarationBaseSpecific) && classes.indexOf(derivedClass) === -1)
                        classes.push(derivedClass);
                }
            }

            return classes;
        }
    };
}

function getAllMembers(classDec: Node<ts.ClassLikeDeclarationBase>, compilerMembers: ts.Node[] | ts.NodeArray<ts.Node>) {
    const isAmbient = isNodeAmbientOrInAmbientContext(classDec);
    // not sure why this cast is necessary, but localized it to here...
    const members = (compilerMembers as any as ts.Node[]).map(m => classDec._getNodeFromCompilerNode(m));

    // filter out the method declarations or constructor declarations without a body if not ambient
    return isAmbient ? members : members.filter(m => {
        if (!(Node.isConstructorDeclaration(m) || Node.isMethodDeclaration(m)))
            return true;
        if (Node.isMethodDeclaration(m) && m.isAbstract())
            return true;
        return m.isImplementation();
    });
}

function getImmediateDerivedClasses(classDec: ClassLikeDeclarationBaseSpecific & NameableNode) {
    const classes: ClassDeclaration[] = [];
    const nameNode = classDec.getNameNode();
    if (nameNode == null)
        return classes;

    for (const node of nameNode.findReferencesAsNodes()) {
        const nodeParent = node.getParentIfKind(SyntaxKind.ExpressionWithTypeArguments);
        if (nodeParent == null)
            continue;
        const heritageClause = nodeParent.getParentIfKind(SyntaxKind.HeritageClause);
        if (heritageClause == null || heritageClause.getToken() !== SyntaxKind.ExtendsKeyword)
            continue;
        const derivedClass = heritageClause.getParentIfKind(SyntaxKind.ClassDeclaration);
        if (derivedClass == null)
            continue;

        classes.push(derivedClass);
    }

    return classes;
}

function isClassPropertyType(m: Node) {
    return Node.isPropertyDeclaration(m)
        || Node.isSetAccessorDeclaration(m)
        || Node.isGetAccessorDeclaration(m)
        || Node.isParameterDeclaration(m);
}

function isSupportedClassMember(m: Node) {
    return Node.isMethodDeclaration(m)
        || Node.isPropertyDeclaration(m)
        || Node.isGetAccessorDeclaration(m)
        || Node.isSetAccessorDeclaration(m)
        || Node.isConstructorDeclaration(m);
}

interface InsertChildrenOptions {
    write: (writer: CodeBlockWriter, info: InsertIntoBracesOrSourceFileOptionsWriteInfo) => void;
    expectedKind: SyntaxKind;
    structures: ReadonlyArray<Structure>;
    index: number;
}

function insertChildren<TNode extends Node>(classDeclaration: ClassLikeDeclarationBaseSpecific & Node, opts: InsertChildrenOptions) {
    return insertIntoBracesOrSourceFileWithGetChildren<TNode>({
        getIndexedChildren: () => classDeclaration.getMembersWithComments(),
        parent: classDeclaration,
        ...opts
    });
}
