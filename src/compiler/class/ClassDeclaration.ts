import * as errors from "../../errors";
import { getEndIndexFromArray, insertIntoBracesOrSourceFileWithGetChildren, insertIntoParentTextRange } from "../../manipulation";
import { ClassDeclarationStructure, ConstructorDeclarationStructure, GetAccessorDeclarationStructure, MethodDeclarationStructure, PropertyDeclarationStructure,
    SetAccessorDeclarationStructure } from "../../structures";
import { SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction, StringUtils, TypeGuards } from "../../utils";
import { AmbientableNode, ChildOrderableNode, DecoratableNode, ExportableNode, HeritageClauseableNode, ImplementsClauseableNode, JSDocableNode, ModifierableNode,
    NameableNode, TextInsertableNode, TypeParameteredNode } from "../base";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { ParameterDeclaration } from "../function";
import { NamespaceChildableNode } from "../namespace";
import { Statement } from "../statement";
import { ExpressionWithTypeArguments, Type } from "../type";
import { AbstractableNode } from "./base";
import { ConstructorDeclaration } from "./ConstructorDeclaration";
import { GetAccessorDeclaration } from "./GetAccessorDeclaration";
import { MethodDeclaration } from "./MethodDeclaration";
import { PropertyDeclaration } from "./PropertyDeclaration";
import { SetAccessorDeclaration } from "./SetAccessorDeclaration";

export type ClassPropertyTypes = PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;
export type ClassInstancePropertyTypes = ClassPropertyTypes | ParameterDeclaration;
export type ClassInstanceMemberTypes = MethodDeclaration | ClassInstancePropertyTypes;
export type ClassStaticPropertyTypes = PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration;
export type ClassStaticMemberTypes = MethodDeclaration | ClassStaticPropertyTypes;
export type ClassMemberTypes = MethodDeclaration | PropertyDeclaration | GetAccessorDeclaration | SetAccessorDeclaration | ConstructorDeclaration;

export const ClassDeclarationBase = ChildOrderableNode(TextInsertableNode(ImplementsClauseableNode(HeritageClauseableNode(DecoratableNode(TypeParameteredNode(
    NamespaceChildableNode(JSDocableNode(AmbientableNode(AbstractableNode(ExportableNode(ModifierableNode(NameableNode(Statement)))))))
))))));
export class ClassDeclaration extends ClassDeclarationBase<ts.ClassDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<ClassDeclarationStructure>) {
        callBaseFill(ClassDeclarationBase.prototype, this, structure);

        if (structure.extends != null)
            this.setExtends(structure.extends);
        if (structure.ctors != null)
            this.addConstructors(structure.ctors);
        if (structure.properties != null)
            this.addProperties(structure.properties);
        if (structure.getAccessors != null)
            this.addGetAccessors(structure.getAccessors);
        if (structure.setAccessors != null)
            this.addSetAccessors(structure.setAccessors);
        if (structure.methods != null)
            this.addMethods(structure.methods);

        return this;
    }

    /**
     * Sets the extends expression.
     * @param text - Text to set as the extends expression.
     */
    setExtends(text: string) {
        if (StringUtils.isNullOrWhitespace(text))
            return this.removeExtends();

        const heritageClauses = this.getHeritageClauses();
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
            return this;
        }

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

        return this;
    }

    /**
     * Removes the extends expression, if it exists.
     */
    removeExtends() {
        const extendsClause = this.getHeritageClauseByKind(SyntaxKind.ExtendsKeyword);
        if (extendsClause == null)
            return this;
        extendsClause.removeExpression(0);
        return this;
    }

    /**
     * Gets the extends expression or throws if it doesn't exist.
     */
    getExtendsOrThrow() {
        return errors.throwIfNullOrUndefined(this.getExtends(), `Expected to find the extends expression for the class ${this.getName()}.`);
    }

    /**
     * Gets the extends expression or returns undefined if it doesn't exist.
     */
    getExtends(): ExpressionWithTypeArguments | undefined {
        const extendsClause = this.getHeritageClauseByKind(SyntaxKind.ExtendsKeyword);
        if (extendsClause == null)
            return undefined;

        const types = extendsClause.getTypeNodes();
        return types.length === 0 ? undefined : types[0];
    }

    /**
     * Adds a constructor.
     * @param structure - Structure of the constructor.
     */
    addConstructor(structure: ConstructorDeclarationStructure = {}) {
        return this.insertConstructor(getEndIndexFromArray(this.getMembers()), structure);
    }

    /**
     * Adds constructors.
     * @param structures - Structures of the constructor.
     */
    addConstructors(structures: ConstructorDeclarationStructure[]) {
        return this.insertConstructors(getEndIndexFromArray(this.getMembers()), structures);
    }

    /**
     * Inserts a constructor.
     * @param index - Child index to insert at.
     * @param structure - Structure of the constructor.
     */
    insertConstructor(index: number, structure: ConstructorDeclarationStructure = {}) {
        return this.insertConstructors(index, [structure])[0];
    }

    /**
     * Inserts constructors.
     * @param index - Child index to insert at.
     * @param structures - Structures of the constructor.
     */
    insertConstructors(index: number, structures: ConstructorDeclarationStructure[]) {
        const isAmbient = this.isAmbient();

        return insertIntoBracesOrSourceFileWithGetChildren<ConstructorDeclaration, ConstructorDeclarationStructure>({
            getIndexedChildren: () => this.getMembers(),
            parent: this,
            index,
            structures,
            expectedKind: SyntaxKind.Constructor,
            write: (writer, info) => {
                if (!isAmbient && info.previousMember != null)
                    writer.blankLineIfLastNot();
                else
                    writer.newLineIfLastNot();
                this.context.structurePrinterFactory.forConstructorDeclaration({ isAmbient }).printTexts(writer, structures);
                if (!isAmbient && info.nextMember != null)
                    writer.blankLineIfLastNot();
                else
                    writer.newLineIfLastNot();
            }
        });
    }

    /**
     * Gets the constructor declarations.
     */
    getConstructors() {
        return this.getMembers().filter(m => TypeGuards.isConstructorDeclaration(m)) as ConstructorDeclaration[];
    }

    /**
     * Add get accessor.
     * @param structure - Structure representing the get accessor.
     */
    addGetAccessor(structure: GetAccessorDeclarationStructure) {
        return this.addGetAccessors([structure])[0];
    }

    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addGetAccessors(structures: GetAccessorDeclarationStructure[]) {
        return this.insertGetAccessors(getEndIndexFromArray(this.getMembers()), structures);
    }

    /**
     * Insert get accessor.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the get accessor.
     */
    insertGetAccessor(index: number, structure: GetAccessorDeclarationStructure) {
        return this.insertGetAccessors(index, [structure])[0];
    }

    /**
     * Insert properties.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertGetAccessors(index: number, structures: GetAccessorDeclarationStructure[]) {
        return insertIntoBracesOrSourceFileWithGetChildren<GetAccessorDeclaration, GetAccessorDeclarationStructure>({
            getIndexedChildren: () => this.getMembers(),
            parent: this,
            index,
            structures,
            expectedKind: SyntaxKind.GetAccessor,
            write: (writer, info) => {
                if (info.previousMember != null)
                    writer.blankLineIfLastNot();
                else
                    writer.newLineIfLastNot();
                this.context.structurePrinterFactory.forGetAccessorDeclaration({ isAmbient: this.isAmbient() }).printTexts(writer, structures);
                if (info.nextMember != null)
                    writer.blankLineIfLastNot();
                else
                    writer.newLineIfLastNot();
            }
        });
    }

    /**
     * Add set accessor.
     * @param structure - Structure representing the set accessor.
     */
    addSetAccessor(structure: SetAccessorDeclarationStructure) {
        return this.addSetAccessors([structure])[0];
    }

    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addSetAccessors(structures: SetAccessorDeclarationStructure[]) {
        return this.insertSetAccessors(getEndIndexFromArray(this.getMembers()), structures);
    }

    /**
     * Insert set accessor.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the set accessor.
     */
    insertSetAccessor(index: number, structure: SetAccessorDeclarationStructure) {
        return this.insertSetAccessors(index, [structure])[0];
    }

    /**
     * Insert properties.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertSetAccessors(index: number, structures: SetAccessorDeclarationStructure[]) {
        return insertIntoBracesOrSourceFileWithGetChildren<SetAccessorDeclaration, SetAccessorDeclarationStructure>({
            getIndexedChildren: () => this.getMembers(),
            parent: this,
            index,
            structures,
            expectedKind: SyntaxKind.SetAccessor,
            write: (writer, info) => {
                if (info.previousMember != null)
                    writer.blankLineIfLastNot();
                else
                    writer.newLineIfLastNot();
                this.context.structurePrinterFactory.forSetAccessorDeclaration({ isAmbient: this.isAmbient() }).printTexts(writer, structures);
                if (info.nextMember != null)
                    writer.blankLineIfLastNot();
                else
                    writer.newLineIfLastNot();
            }
        });
    }

    /**
     * Add property.
     * @param structure - Structure representing the property.
     */
    addProperty(structure: PropertyDeclarationStructure) {
        return this.addProperties([structure])[0];
    }

    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addProperties(structures: PropertyDeclarationStructure[]) {
        return this.insertProperties(getEndIndexFromArray(this.getMembers()), structures);
    }

    /**
     * Insert property.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the property.
     */
    insertProperty(index: number, structure: PropertyDeclarationStructure) {
        return this.insertProperties(index, [structure])[0];
    }

    /**
     * Insert properties.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertProperties(index: number, structures: PropertyDeclarationStructure[]) {
        return insertIntoBracesOrSourceFileWithGetChildren<PropertyDeclaration, PropertyDeclarationStructure>({
            getIndexedChildren: () => this.getMembers(),
            parent: this,
            index,
            structures,
            expectedKind: SyntaxKind.PropertyDeclaration,
            write: (writer, info) => {
                if (info.previousMember != null && TypeGuards.hasBody(info.previousMember))
                    writer.blankLineIfLastNot();
                else
                    writer.newLineIfLastNot();
                this.context.structurePrinterFactory.forPropertyDeclaration().printTexts(writer, structures);
                if (info.nextMember != null && TypeGuards.hasBody(info.nextMember))
                    writer.blankLineIfLastNot();
                else
                    writer.newLineIfLastNot();
            }
        });
    }

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
    getInstanceProperty(nameOrFindFunction: string | ((prop: ClassInstancePropertyTypes) => boolean)): ClassInstancePropertyTypes | undefined {
        return getNodeByNameOrFindFunction(this.getInstanceProperties(), nameOrFindFunction);
    }

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
    getInstancePropertyOrThrow(nameOrFindFunction: string | ((prop: ClassInstancePropertyTypes) => boolean)): ClassInstancePropertyTypes {
        return errors.throwIfNullOrUndefined(this.getInstanceProperty(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("class instance property", nameOrFindFunction));
    }

    /**
     * Gets the class instance property declarations.
     */
    getInstanceProperties(): ClassInstancePropertyTypes[] {
        return this.getInstanceMembers()
            .filter(m => isClassPropertyType(m)) as ClassInstancePropertyTypes[];
    }

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
    getStaticProperty(nameOrFindFunction: string | ((prop: ClassStaticPropertyTypes) => boolean)): ClassStaticPropertyTypes | undefined {
        return getNodeByNameOrFindFunction(this.getStaticProperties(), nameOrFindFunction);
    }

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
    getStaticPropertyOrThrow(nameOrFindFunction: string | ((prop: ClassStaticPropertyTypes) => boolean)): ClassStaticPropertyTypes {
        return errors.throwIfNullOrUndefined(this.getStaticProperty(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("class static property", nameOrFindFunction));
    }

    /**
     * Gets the class instance property declarations.
     */
    getStaticProperties(): ClassStaticPropertyTypes[] {
        return this.getStaticMembers()
            .filter(m => isClassPropertyType(m)) as ClassStaticPropertyTypes[];
    }

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
    getProperty(nameOrFindFunction: string | ((property: PropertyDeclaration) => boolean)): PropertyDeclaration | undefined {
        return getNodeByNameOrFindFunction(this.getProperties(), nameOrFindFunction);
    }

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
    getPropertyOrThrow(nameOrFindFunction: string | ((property: PropertyDeclaration) => boolean)): PropertyDeclaration {
        return errors.throwIfNullOrUndefined(this.getProperty(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("class property declaration", nameOrFindFunction));
    }

    /**
     * Gets the class property declarations regardless of whether it's an instance of static property.
     */
    getProperties() {
        return this.getMembers()
            .filter(m => TypeGuards.isPropertyDeclaration(m)) as PropertyDeclaration[];
    }

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
    getGetAccessor(nameOrFindFunction: string | ((getAccessor: GetAccessorDeclaration) => boolean)): GetAccessorDeclaration | undefined {
        return getNodeByNameOrFindFunction(this.getGetAccessors(), nameOrFindFunction);
    }

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
    getGetAccessorOrThrow(nameOrFindFunction: string | ((getAccessor: GetAccessorDeclaration) => boolean)): GetAccessorDeclaration {
        return errors.throwIfNullOrUndefined(this.getGetAccessor(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("class getAccessor declaration", nameOrFindFunction));
    }

    /**
     * Gets the class get accessor declarations regardless of whether it's an instance of static getAccessor.
     */
    getGetAccessors() {
        return this.getMembers()
            .filter(m => TypeGuards.isGetAccessorDeclaration(m)) as GetAccessorDeclaration[];
    }

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
    getSetAccessor(nameOrFindFunction: string | ((setAccessor: SetAccessorDeclaration) => boolean)): SetAccessorDeclaration | undefined {
        return getNodeByNameOrFindFunction(this.getSetAccessors(), nameOrFindFunction);
    }

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
    getSetAccessorOrThrow(nameOrFindFunction: string | ((setAccessor: SetAccessorDeclaration) => boolean)): SetAccessorDeclaration {
        return errors.throwIfNullOrUndefined(this.getSetAccessor(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("class setAccessor declaration", nameOrFindFunction));
    }

    /**
     * Sets the class set accessor declarations regardless of whether it's an instance of static setAccessor.
     */
    getSetAccessors() {
        return this.getMembers()
            .filter(m => TypeGuards.isSetAccessorDeclaration(m)) as SetAccessorDeclaration[];
    }

    /**
     * Add method.
     * @param structure - Structure representing the method.
     */
    addMethod(structure: MethodDeclarationStructure) {
        return this.addMethods([structure])[0];
    }

    /**
     * Add methods.
     * @param structures - Structures representing the methods.
     */
    addMethods(structures: MethodDeclarationStructure[]) {
        return this.insertMethods(getEndIndexFromArray(this.getMembers()), structures);
    }

    /**
     * Insert method.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the method.
     */
    insertMethod(index: number, structure: MethodDeclarationStructure) {
        return this.insertMethods(index, [structure])[0];
    }

    /**
     * Insert methods.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the methods.
     */
    insertMethods(index: number, structures: MethodDeclarationStructure[]) {
        const isAmbient = this.isAmbient();
        structures = structures.map(s => ({...s}));

        // insert, fill, and get created nodes
        return insertIntoBracesOrSourceFileWithGetChildren<MethodDeclaration, MethodDeclarationStructure>({
            parent: this,
            index,
            getIndexedChildren: () => this.getMembers(),
            write: (writer, info) => {
                if (!isAmbient && info.previousMember != null)
                    writer.blankLineIfLastNot();
                else
                    writer.newLineIfLastNot();
                this.context.structurePrinterFactory.forMethodDeclaration({ isAmbient }).printTexts(writer, structures);
                if (!isAmbient && info.nextMember != null)
                    writer.blankLineIfLastNot();
                else
                    writer.newLineIfLastNot();
            },
            structures,
            expectedKind: SyntaxKind.MethodDeclaration
        });
    }

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
    getMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined {
        return getNodeByNameOrFindFunction(this.getMethods(), nameOrFindFunction);
    }

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
    getMethodOrThrow(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration {
        return errors.throwIfNullOrUndefined(this.getMethod(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("class method declaration", nameOrFindFunction));
    }

    /**
     * Gets the class method declarations regardless of whether it's an instance of static method.
     */
    getMethods() {
        return this.getMembers()
            .filter(m => TypeGuards.isMethodDeclaration(m)) as MethodDeclaration[];
    }

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
    getInstanceMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined {
        return getNodeByNameOrFindFunction(this.getInstanceMethods(), nameOrFindFunction);
    }

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
    getInstanceMethodOrThrow(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration {
        return errors.throwIfNullOrUndefined(this.getInstanceMethod(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("class instance method", nameOrFindFunction));
    }

    /**
     * Gets the class instance method declarations.
     */
    getInstanceMethods(): MethodDeclaration[] {
        return this.getInstanceMembers().filter(m => m instanceof MethodDeclaration) as MethodDeclaration[];
    }

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
    getStaticMethod(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration | undefined {
        return getNodeByNameOrFindFunction(this.getStaticMethods(), nameOrFindFunction);
    }

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
    getStaticMethodOrThrow(nameOrFindFunction: string | ((method: MethodDeclaration) => boolean)): MethodDeclaration {
        return errors.throwIfNullOrUndefined(this.getStaticMethod(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("class static method", nameOrFindFunction));
    }

    /**
     * Gets the class instance method declarations.
     */
    getStaticMethods(): MethodDeclaration[] {
        return this.getStaticMembers().filter(m => m instanceof MethodDeclaration) as MethodDeclaration[];
    }

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
    getInstanceMember(nameOrFindFunction: string | ((member: ClassInstanceMemberTypes) => boolean)): ClassInstanceMemberTypes | undefined {
        return getNodeByNameOrFindFunction(this.getInstanceMembers(), nameOrFindFunction);
    }

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
    getInstanceMemberOrThrow(nameOrFindFunction: string | ((member: ClassInstanceMemberTypes) => boolean)): ClassInstanceMemberTypes {
        return errors.throwIfNullOrUndefined(this.getInstanceMember(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("class instance member", nameOrFindFunction));
    }

    /**
     * Gets the instance members.
     */
    getInstanceMembers() {
        return this.getMembersWithParameterProperties()
            .filter(m => !TypeGuards.isConstructorDeclaration(m) && (TypeGuards.isParameterDeclaration(m) || !m.isStatic())) as ClassInstanceMemberTypes[];
    }

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
    getStaticMember(nameOrFindFunction: string | ((member: ClassStaticMemberTypes) => boolean)): ClassStaticMemberTypes | undefined {
        return getNodeByNameOrFindFunction(this.getStaticMembers(), nameOrFindFunction);
    }

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
    getStaticMemberOrThrow(nameOrFindFunction: string | ((member: ClassStaticMemberTypes) => boolean)): ClassStaticMemberTypes {
        return errors.throwIfNullOrUndefined(this.getStaticMember(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("class static member", nameOrFindFunction));
    }

    /**
     * Gets the static members.
     */
    getStaticMembers() {
        return this.getMembers().filter(m => !TypeGuards.isConstructorDeclaration(m) && !(m instanceof ParameterDeclaration) && m.isStatic()) as ClassStaticMemberTypes[];
    }

    /**
     * Gets the class members regardless of whether an instance of static member with parameter properties.
     * @internal
     */
    getMembersWithParameterProperties() {
        const members: (ClassMemberTypes | ParameterDeclaration)[] = this.getMembers();
        const implementationCtors = members.filter(c => TypeGuards.isConstructorDeclaration(c) && c.isImplementation()) as ConstructorDeclaration[];
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

    /**
     * Gets the class' members regardless of whether it's an instance of static member.
     */
    getMembers() {
        return getAllMembers(this).filter(m => isSupportedClassMember(m)) as ClassMemberTypes[];

        function getAllMembers(classDec: ClassDeclaration) {
            const members = classDec.compilerNode.members.map(m => classDec.getNodeFromCompilerNode(m));

            // filter out the method declarations or constructor declarations without a body if not ambient
            return classDec.isAmbient() ? members : members.filter(m => {
                if (!(TypeGuards.isConstructorDeclaration(m) || TypeGuards.isMethodDeclaration(m)))
                    return true;
                if (TypeGuards.isMethodDeclaration(m) && m.isAbstract())
                    return true;
                return m.isImplementation();
            });
        }
    }

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
    getMember(nameOrFindFunction: string | ((member: ClassMemberTypes) => boolean)): ClassMemberTypes | undefined {
        return getNodeByNameOrFindFunction(this.getMembers(), nameOrFindFunction);
    }

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
    getMemberOrThrow(nameOrFindFunction: string | ((member: ClassMemberTypes) => boolean)): ClassMemberTypes {
        return errors.throwIfNullOrUndefined(this.getMember(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("class member", nameOrFindFunction));
    }

    /**
     * Gets the base types.
     *
     * This is useful to use if the base could possibly be a mixin.
     */
    getBaseTypes(): Type[] {
        return this.getType().getBaseTypes();
    }

    /**
     * Gets the base class or throws.
     *
     * Note: Use getBaseTypes if you need to get the mixins.
     */
    getBaseClassOrThrow() {
        return errors.throwIfNullOrUndefined(this.getBaseClass(), `Expected to find the base class of ${this.getName()}.`);
    }

    /**
     * Gets the base class.
     *
     * Note: Use getBaseTypes if you need to get the mixins.
     */
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

    /**
     * Gets all the derived classes.
     */
    getDerivedClasses() {
        const classes = this.getImmediateDerivedClasses();

        for (let i = 0; i < classes.length; i++) {
            const derivedClasses = classes[i].getImmediateDerivedClasses();
            for (const derivedClass of derivedClasses) {
                // don't allow circular references
                if (derivedClass !== this && classes.indexOf(derivedClass) === -1)
                    classes.push(derivedClass);
            }
        }

        return classes;
    }

    private getImmediateDerivedClasses() {
        const classes: ClassDeclaration[] = [];
        const nameNode = this.getNameNode();
        if (nameNode == null)
            return classes;

        for (const node of nameNode.findReferencesAsNodes()) {
            const nodeParent = node.getParentIfKind(SyntaxKind.ExpressionWithTypeArguments);
            if (nodeParent == null)
                continue;
            const heritageClause = nodeParent.getParentIfKind(SyntaxKind.HeritageClause);
            if (heritageClause == null || heritageClause.getToken() !== SyntaxKind.ExtendsKeyword)
                continue;
            classes.push(heritageClause.getFirstAncestorByKindOrThrow(SyntaxKind.ClassDeclaration));
        }

        return classes;
    }
}

function isClassPropertyType(m: Node) {
    return TypeGuards.isPropertyDeclaration(m)
        || TypeGuards.isSetAccessorDeclaration(m)
        || TypeGuards.isGetAccessorDeclaration(m)
        || TypeGuards.isParameterDeclaration(m);
}

function isSupportedClassMember(m: Node) {
    return TypeGuards.isMethodDeclaration(m)
        || TypeGuards.isPropertyDeclaration(m)
        || TypeGuards.isGetAccessorDeclaration(m)
        || TypeGuards.isSetAccessorDeclaration(m)
        || TypeGuards.isConstructorDeclaration(m);
}
