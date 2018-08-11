import { CodeBlockWriter } from "../../codeBlockWriter";
import * as errors from "../../errors";
import { InsertIntoBracesOrSourceFileOptionsWriteInfo, insertIntoBracesOrSourceFileWithGetChildren, removeStatementedNodeChildren,
    verifyAndGetIndex } from "../../manipulation";
import { ClassDeclarationStructure, EnumDeclarationStructure, FunctionDeclarationStructure, InterfaceDeclarationStructure, NamespaceDeclarationStructure,
    StatementedNodeStructure, TypeAliasDeclarationStructure, VariableStatementStructure } from "../../structures";
import { Constructor, WriterFunction } from "../../types";
import { SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction, getSyntaxKindName, isNodeAmbientOrInAmbientContext,
    TypeGuards } from "../../utils";
import { callBaseFill } from "../callBaseFill";
import { ClassDeclaration } from "../class";
import { Node } from "../common";
import { EnumDeclaration } from "../enum";
import { FunctionDeclaration } from "../function";
import { InterfaceDeclaration } from "../interface";
import { KindToNodeMappings } from "../kindToNodeMappings";
import { NamespaceDeclaration } from "../namespace";
import { Statement, VariableStatement } from "../statement";
import { VariableDeclaration } from "../variable";
import { TypeAliasDeclaration } from "../type";

export type StatementedNodeExtensionType = Node<ts.SourceFile | ts.FunctionDeclaration | ts.ModuleDeclaration | ts.FunctionLikeDeclaration | ts.CaseClause | ts.DefaultClause>;

export interface StatementedNode {
    /**
     * Gets the node's statements.
     */
    getStatements(): Statement[];
    /**
     * Gets the first statement that matches the provided condition or returns undefined if it doesn't exist.
     * @param findFunction - Function to find the statement by.
     */
    getStatement(findFunction: (statement: Node) => boolean): Statement | undefined;
    /**
     * Gets the first statement that matches the provided condition or throws if it doesn't exist.
     * @param findFunction - Function to find the statement by.
     */
    getStatementOrThrow(findFunction: (statement: Node) => boolean): Statement;
    /**
     * Gets the first statement that matches the provided syntax kind or returns undefined if it doesn't exist.
     * @param kind - Syntax kind to find the node by.
     */
    getStatementByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind] | undefined;
    /**
     * Gets the first statement that matches the provided syntax kind or throws if it doesn't exist.
     * @param kind - Syntax kind to find the node by.
     */
    getStatementByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappings[TKind];
    /**
     * Adds statements.
     * @param text - Text of the statement or statements to add.
     * @returns The statements that were added.
     */
    addStatements(text: string): Statement[];
    /**
     * Add statements.
     * @param writerFunction - Write the text using the provided writer.
     * @returns The statements that were added.
     */
    addStatements(writerFunction: WriterFunction): Statement[];
    /**
     * Inserts statements at the specified index.
     * @param index - Child index to insert at.
     * @param text - Text of the statement or statements to insert.
     * @returns The statements that were inserted.
     */
    insertStatements(index: number, text: string): Statement[];
    /**
     * Inserts statements at the specified index.
     * @param index - Child index to insert at.
     * @param writerFunction - Write the text using the provided writer.
     * @returns The statements that were inserted.
     */
    insertStatements(index: number, writerFunction: WriterFunction): Statement[];
    /**
     * Removes the statement at the specified index.
     * @param index - Child index to remove the statement at.
     */
    removeStatement(index: number): this;
    /**
     * Removes the statements at the specified index range.
     * @param indexRange - The start and end inclusive index range to remove.
     */
    removeStatements(indexRange: [number, number]): this;
    /**
     * Adds an class declaration as a child.
     * @param structure - Structure of the class declaration to add.
     */
    addClass(structure: ClassDeclarationStructure): ClassDeclaration;
    /**
     * Adds class declarations as a child.
     * @param structures - Structures of the class declarations to add.
     */
    addClasses(structures: ClassDeclarationStructure[]): ClassDeclaration[];
    /**
     * Inserts an class declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the class declaration to insert.
     */
    insertClass(index: number, structure: ClassDeclarationStructure): ClassDeclaration;
    /**
     * Inserts class declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the class declarations to insert.
     */
    insertClasses(index: number, structures: ClassDeclarationStructure[]): ClassDeclaration[];
    /**
     * Gets the direct class declaration children.
     */
    getClasses(): ClassDeclaration[];
    /**
     * Gets a class.
     * @param name - Name of the class.
     */
    getClass(name: string): ClassDeclaration | undefined;
    /**
     * Gets a class.
     * @param findFunction - Function to use to find the class.
     */
    getClass(findFunction: (declaration: ClassDeclaration) => boolean): ClassDeclaration | undefined;
    /**
     * Gets a class or throws if it doesn't exist.
     * @param name - Name of the class.
     */
    getClassOrThrow(name: string): ClassDeclaration;
    /**
     * Gets a class or throws if it doesn't exist.
     * @param findFunction - Function to use to find the class.
     */
    getClassOrThrow(findFunction: (declaration: ClassDeclaration) => boolean): ClassDeclaration;
    /**
     * Adds an enum declaration as a child.
     * @param structure - Structure of the enum declaration to add.
     */
    addEnum(structure: EnumDeclarationStructure): EnumDeclaration;
    /**
     * Adds enum declarations as a child.
     * @param structures - Structures of the enum declarations to add.
     */
    addEnums(structures: EnumDeclarationStructure[]): EnumDeclaration[];
    /**
     * Inserts an enum declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the enum declaration to insert.
     */
    insertEnum(index: number, structure: EnumDeclarationStructure): EnumDeclaration;
    /**
     * Inserts enum declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the enum declarations to insert.
     */
    insertEnums(index: number, structures: EnumDeclarationStructure[]): EnumDeclaration[];
    /**
     * Gets the direct enum declaration children.
     */
    getEnums(): EnumDeclaration[];
    /**
     * Gets an enum.
     * @param name - Name of the enum.
     */
    getEnum(name: string): EnumDeclaration | undefined;
    /**
     * Gets an enum.
     * @param findFunction - Function to use to find the enum.
     */
    getEnum(findFunction: (declaration: EnumDeclaration) => boolean): EnumDeclaration | undefined;
    /**
     * Gets an enum or throws if it doesn't exist.
     * @param name - Name of the enum.
     */
    getEnumOrThrow(name: string): EnumDeclaration;
    /**
     * Gets an enum or throws if it doesn't exist.
     * @param findFunction - Function to use to find the enum.
     */
    getEnumOrThrow(findFunction: (declaration: EnumDeclaration) => boolean): EnumDeclaration;
    /**
     * Adds a function declaration as a child.
     * @param structure - Structure of the function declaration to add.
     */
    addFunction(structure: FunctionDeclarationStructure): FunctionDeclaration;
    /**
     * Adds function declarations as a child.
     * @param structures - Structures of the function declarations to add.
     */
    addFunctions(structures: FunctionDeclarationStructure[]): FunctionDeclaration[];
    /**
     * Inserts an function declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the function declaration to insert.
     */
    insertFunction(index: number, structure: FunctionDeclarationStructure): FunctionDeclaration;
    /**
     * Inserts function declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the function declarations to insert.
     */
    insertFunctions(index: number, structures: FunctionDeclarationStructure[]): FunctionDeclaration[];
    /**
     * Gets the direct function declaration children.
     */
    getFunctions(): FunctionDeclaration[];
    /**
     * Gets a function.
     * @param name - Name of the function.
     */
    getFunction(name: string): FunctionDeclaration | undefined;
    /**
     * Gets a function.
     * @param findFunction - Function to use to find the function.
     */
    getFunction(findFunction: (declaration: FunctionDeclaration) => boolean): FunctionDeclaration | undefined;
    /**
     * Gets a function or throws if it doesn't exist.
     * @param name - Name of the function.
     */
    getFunctionOrThrow(name: string): FunctionDeclaration;
    /**
     * Gets a function or throws if it doesn't exist.
     * @param findFunction - Function to use to find the function.
     */
    getFunctionOrThrow(findFunction: (declaration: FunctionDeclaration) => boolean): FunctionDeclaration;
    /**
     * Adds a interface declaration as a child.
     * @param structure - Structure of the interface declaration to add.
     */
    addInterface(structure: InterfaceDeclarationStructure): InterfaceDeclaration;
    /**
     * Adds interface declarations as a child.
     * @param structures - Structures of the interface declarations to add.
     */
    addInterfaces(structures: InterfaceDeclarationStructure[]): InterfaceDeclaration[];
    /**
     * Inserts an interface declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the interface declaration to insert.
     */
    insertInterface(index: number, structure: InterfaceDeclarationStructure): InterfaceDeclaration;
    /**
     * Inserts interface declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the interface declarations to insert.
     */
    insertInterfaces(index: number, structures: InterfaceDeclarationStructure[]): InterfaceDeclaration[];
    /**
     * Gets the direct interface declaration children.
     */
    getInterfaces(): InterfaceDeclaration[];
    /**
     * Gets an interface.
     * @param name - Name of the interface.
     */
    getInterface(name: string): InterfaceDeclaration | undefined;
    /**
     * Gets an interface.
     * @param findFunction - Function to use to find the interface.
     */
    getInterface(findFunction: (declaration: InterfaceDeclaration) => boolean): InterfaceDeclaration | undefined;
    /**
     * Gets an interface or throws if it doesn't exist.
     * @param name - Name of the interface.
     */
    getInterfaceOrThrow(name: string): InterfaceDeclaration;
    /**
     * Gets an interface or throws if it doesn't exist.
     * @param findFunction - Function to use to find the interface.
     */
    getInterfaceOrThrow(findFunction: (declaration: InterfaceDeclaration) => boolean): InterfaceDeclaration;
    /**
     * Adds a namespace declaration as a child.
     * @param structure - Structure of the namespace declaration to add.
     */
    addNamespace(structure: NamespaceDeclarationStructure): NamespaceDeclaration;
    /**
     * Adds namespace declarations as a child.
     * @param structures - Structures of the namespace declarations to add.
     */
    addNamespaces(structures: NamespaceDeclarationStructure[]): NamespaceDeclaration[];
    /**
     * Inserts an namespace declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the namespace declaration to insert.
     */
    insertNamespace(index: number, structure: NamespaceDeclarationStructure): NamespaceDeclaration;
    /**
     * Inserts namespace declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the namespace declarations to insert.
     */
    insertNamespaces(index: number, structures: NamespaceDeclarationStructure[]): NamespaceDeclaration[];
    /**
     * Gets the direct namespace declaration children.
     */
    getNamespaces(): NamespaceDeclaration[];
    /**
     * Gets a namespace.
     * @param name - Name of the namespace.
     */
    getNamespace(name: string): NamespaceDeclaration | undefined;
    /**
     * Gets a namespace.
     * @param findFunction - Function to use to find the namespace.
     */
    getNamespace(findFunction: (declaration: NamespaceDeclaration) => boolean): NamespaceDeclaration | undefined;
    /**
     * Gets a namespace or throws if it doesn't exist.
     * @param name - Name of the namespace.
     */
    getNamespaceOrThrow(name: string): NamespaceDeclaration;
    /**
     * Gets a namespace or throws if it doesn't exist.
     * @param findFunction - Function to use to find the namespace.
     */
    getNamespaceOrThrow(findFunction: (declaration: NamespaceDeclaration) => boolean): NamespaceDeclaration;
    /**
     * Adds a type alias declaration as a child.
     * @param structure - Structure of the type alias declaration to add.
     */
    addTypeAlias(structure: TypeAliasDeclarationStructure): TypeAliasDeclaration;
    /**
     * Adds type alias declarations as a child.
     * @param structures - Structures of the type alias declarations to add.
     */
    addTypeAliases(structures: TypeAliasDeclarationStructure[]): TypeAliasDeclaration[];
    /**
     * Inserts an type alias declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the type alias declaration to insert.
     */
    insertTypeAlias(index: number, structure: TypeAliasDeclarationStructure): TypeAliasDeclaration;
    /**
     * Inserts type alias declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the type alias declarations to insert.
     */
    insertTypeAliases(index: number, structures: TypeAliasDeclarationStructure[]): TypeAliasDeclaration[];
    /**
     * Gets the direct type alias declaration children.
     */
    getTypeAliases(): TypeAliasDeclaration[];
    /**
     * Gets a type alias.
     * @param name - Name of the type alias.
     */
    getTypeAlias(name: string): TypeAliasDeclaration | undefined;
    /**
     * Gets a type alias.
     * @param findFunction - Function to use to find the type alias.
     */
    getTypeAlias(findFunction: (declaration: TypeAliasDeclaration) => boolean): TypeAliasDeclaration | undefined;
    /**
     * Gets a type alias or throws if it doesn't exist.
     * @param name - Name of the type alias.
     */
    getTypeAliasOrThrow(name: string): TypeAliasDeclaration;
    /**
     * Gets a type alias or throws if it doesn't exist.
     * @param findFunction - Function to use to find the type alias.
     */
    getTypeAliasOrThrow(findFunction: (declaration: TypeAliasDeclaration) => boolean): TypeAliasDeclaration;
    /**
     * Adds a variable statement.
     * @param structure - Structure of the variable statement.
     */
    addVariableStatement(structure: VariableStatementStructure): VariableStatement;
    /**
     * Adds variable statements.
     * @param structures - Structures of the variable statements.
     */
    addVariableStatements(structures: VariableStatementStructure[]): VariableStatement[];
    /**
     * Inserts a variable statement.
     * @param structure - Structure of the variable statement.
     */
    insertVariableStatement(index: number, structure: VariableStatementStructure): VariableStatement;
    /**
     * Inserts variable statements.
     * @param structures - Structures of the variable statements.
     */
    insertVariableStatements(index: number, structures: VariableStatementStructure[]): VariableStatement[];
    /**
     * Gets the direct variable statement children.
     */
    getVariableStatements(): VariableStatement[];
    /**
     * Gets a variable statement.
     * @param findFunction - Function to use to find the variable statement.
     */
    getVariableStatement(findFunction: (declaration: VariableStatement) => boolean): VariableStatement | undefined;
    /**
     * Gets a variable statement or throws if it doesn't exist.
     * @param findFunction - Function to use to find the variable statement.
     */
    getVariableStatementOrThrow(findFunction: (declaration: VariableStatement) => boolean): VariableStatement;
    /**
     * Gets all the variable declarations within all the variable declarations of the direct variable statement children.
     */
    getVariableDeclarations(): VariableDeclaration[];
    /**
     * Gets a variable declaration.
     * @param name - Name of the variable declaration.
     */
    getVariableDeclaration(name: string): VariableDeclaration | undefined;
    /**
     * Gets a variable declaration.
     * @param findFunction - Function to use to find the variable declaration.
     */
    getVariableDeclaration(findFunction: (declaration: VariableDeclaration) => boolean): VariableDeclaration | undefined;
    /**
     * Gets a variable declaration or throws if it doesn't exist.
     * @param name - Name of the variable declaration.
     */
    getVariableDeclarationOrThrow(name: string): VariableDeclaration;
    /**
     * Gets a variable declaration or throws if it doesn't exist.
     * @param findFunction - Function to use to find the variable declaration.
     */
    getVariableDeclarationOrThrow(findFunction: (declaration: VariableDeclaration) => boolean): VariableDeclaration;
    /** @internal */
    _insertChildren<TNode extends Node, TStructure>(opts: InsertChildrenOptions<TStructure>): TNode[];
    /** @internal */
    _standardWrite(writer: CodeBlockWriter, info: InsertIntoBracesOrSourceFileOptionsWriteInfo, writeStructures: () => void, opts?: StandardWriteOptions): void;
}

/** @internal */
export interface InsertChildrenOptions<TStructure> {
    expectedKind: SyntaxKind;
    index: number;
    structures: TStructure[];
    write: (writer: CodeBlockWriter, info: InsertIntoBracesOrSourceFileOptionsWriteInfo) => void;
}

/** @internal */
export interface StandardWriteOptions {
    previousNewLine?: (previousMember: Node) => void;
    nextNewLine?: (nextMember: Node) => void;
}

export function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T {
    return class extends Base implements StatementedNode {
        /* General */
        getStatements() {
            return this.getCompilerStatements().map(s => this.getNodeFromCompilerNode(s));
        }

        getStatement(findFunction: (statement: Node) => boolean) {
            // explicit type arg necessary in ts 3.0 for some reason
            return ArrayUtils.find<Statement>(this.getStatements(), findFunction);
        }

        getStatementOrThrow(findFunction: (statement: Node) => boolean) {
            return errors.throwIfNullOrUndefined(this.getStatement(findFunction), "Expected to find a statement matching the provided condition.");
        }

        getStatementByKind(kind: SyntaxKind) {
            const statement = ArrayUtils.find(this.getCompilerStatements(), s => s.kind === kind);
            return this.getNodeFromCompilerNodeIfExists(statement);
        }

        getStatementByKindOrThrow(kind: SyntaxKind) {
            return errors.throwIfNullOrUndefined(this.getStatementByKind(kind), `Expected to find a statement with syntax kind ${getSyntaxKindName(kind)}.`);
        }

        addStatements(text: string): Statement[];
        addStatements(writerFunction: WriterFunction): Statement[];
        addStatements(textOrWriterFunction: string | WriterFunction) {
            return this.insertStatements(this.getCompilerStatements().length, textOrWriterFunction);
        }

        insertStatements(index: number, text: string): Statement[];
        insertStatements(index: number, writerFunction: WriterFunction): Statement[];
        insertStatements(index: number, textOrWriterFunction: string | WriterFunction): Statement[];
        insertStatements(index: number, textOrWriterFunction: string | WriterFunction) {
            return getChildSyntaxList.call(this).insertChildText(index, textOrWriterFunction);

            function getChildSyntaxList(this: Node) {
                const childSyntaxList = this.getChildSyntaxListOrThrow();

                // case and default clauses can optionally have blocks
                if (TypeGuards.isCaseClause(this) || TypeGuards.isDefaultClause(this)) {
                    const block = childSyntaxList.getFirstChildIfKind(SyntaxKind.Block);
                    if (block != null)
                        return block.getChildSyntaxListOrThrow();
                }

                return childSyntaxList;
            }
        }

        removeStatement(index: number) {
            index = verifyAndGetIndex(index, this.getCompilerStatements().length - 1);
            return this.removeStatements([index, index]);
        }

        removeStatements(indexRange: [number, number]) {
            const statements = this.getStatements();
            errors.throwIfRangeOutOfRange(indexRange, [0, statements.length], nameof(indexRange));

            removeStatementedNodeChildren(statements.slice(indexRange[0], indexRange[1] + 1));

            return this;
        }

        /* Classes */

        addClass(structure: ClassDeclarationStructure) {
            return this.addClasses([structure])[0];
        }

        addClasses(structures: ClassDeclarationStructure[]) {
            return this.insertClasses(this.getCompilerStatements().length, structures);
        }

        insertClass(index: number, structure: ClassDeclarationStructure) {
            return this.insertClasses(index, [structure])[0];
        }

        insertClasses(index: number, structures: ClassDeclarationStructure[]): ClassDeclaration[] {
            return this._insertChildren<ClassDeclaration, ClassDeclarationStructure>({
                expectedKind: SyntaxKind.ClassDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this.context.structurePrinterFactory.forClassDeclaration({ isAmbient: isNodeAmbientOrInAmbientContext(this) }).printTexts(writer, structures);
                    });
                }
            });
        }

        getClasses(): ClassDeclaration[] {
            // todo: remove type assertion
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.ClassDeclaration);
        }

        getClass(name: string): ClassDeclaration | undefined;
        getClass(findFunction: (declaration: ClassDeclaration) => boolean): ClassDeclaration | undefined;
        getClass(nameOrFindFunction: string | ((declaration: ClassDeclaration) => boolean)): ClassDeclaration | undefined;
        getClass(nameOrFindFunction: string | ((declaration: ClassDeclaration) => boolean)): ClassDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getClasses(), nameOrFindFunction);
        }

        getClassOrThrow(name: string): ClassDeclaration;
        getClassOrThrow(findFunction: (declaration: ClassDeclaration) => boolean): ClassDeclaration;
        getClassOrThrow(nameOrFindFunction: string | ((declaration: ClassDeclaration) => boolean)): ClassDeclaration {
            return errors.throwIfNullOrUndefined(this.getClass(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("class", nameOrFindFunction));
        }

        /* Enums */

        addEnum(structure: EnumDeclarationStructure) {
            return this.addEnums([structure])[0];
        }

        addEnums(structures: EnumDeclarationStructure[]) {
            return this.insertEnums(this.getCompilerStatements().length, structures);
        }

        insertEnum(index: number, structure: EnumDeclarationStructure) {
            return this.insertEnums(index, [structure])[0];
        }

        insertEnums(index: number, structures: EnumDeclarationStructure[]): EnumDeclaration[] {
            return this._insertChildren<EnumDeclaration, EnumDeclarationStructure>({
                expectedKind: SyntaxKind.EnumDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this.context.structurePrinterFactory.forEnumDeclaration().printTexts(writer, structures);
                    });
                }
            });
        }

        getEnums(): EnumDeclaration[] {
            // todo: remove type assertion
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.EnumDeclaration);
        }

        getEnum(name: string): EnumDeclaration | undefined;
        getEnum(findFunction: (declaration: EnumDeclaration) => boolean): EnumDeclaration | undefined;
        getEnum(nameOrFindFunction: string | ((declaration: EnumDeclaration) => boolean)): EnumDeclaration | undefined;
        getEnum(nameOrFindFunction: string | ((declaration: EnumDeclaration) => boolean)): EnumDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getEnums(), nameOrFindFunction);
        }

        getEnumOrThrow(name: string): EnumDeclaration;
        getEnumOrThrow(findFunction: (declaration: EnumDeclaration) => boolean): EnumDeclaration;
        getEnumOrThrow(nameOrFindFunction: string | ((declaration: EnumDeclaration) => boolean)): EnumDeclaration {
            return errors.throwIfNullOrUndefined(this.getEnum(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("enum", nameOrFindFunction));
        }

        /* Functions */

        addFunction(structure: FunctionDeclarationStructure) {
            return this.addFunctions([structure])[0];
        }

        addFunctions(structures: FunctionDeclarationStructure[]) {
            return this.insertFunctions(this.getCompilerStatements().length, structures);
        }

        insertFunction(index: number, structure: FunctionDeclarationStructure) {
            return this.insertFunctions(index, [structure])[0];
        }

        insertFunctions(index: number, structures: FunctionDeclarationStructure[]): FunctionDeclaration[] {
            return this._insertChildren<FunctionDeclaration, FunctionDeclarationStructure>({
                expectedKind: SyntaxKind.FunctionDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this.context.structurePrinterFactory.forFunctionDeclaration().printTexts(writer, structures);
                    }, {
                        previousNewLine: previousMember =>
                            structures[0].hasDeclareKeyword && TypeGuards.isFunctionDeclaration(previousMember) && previousMember.getBody() == null,
                        nextNewLine: nextMember =>
                            structures[structures.length - 1].hasDeclareKeyword && TypeGuards.isFunctionDeclaration(nextMember) && nextMember.getBody() == null
                    });
                }
            });
        }

        getFunctions(): FunctionDeclaration[] {
            // todo: remove type assertion
            return (this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.FunctionDeclaration))
                .filter(f => f.isAmbient() || f.isImplementation());
        }

        getFunction(name: string): FunctionDeclaration | undefined;
        getFunction(findFunction: (declaration: FunctionDeclaration) => boolean): FunctionDeclaration | undefined;
        getFunction(nameOrFindFunction: string | ((declaration: FunctionDeclaration) => boolean)): FunctionDeclaration | undefined;
        getFunction(nameOrFindFunction: string | ((declaration: FunctionDeclaration) => boolean)): FunctionDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getFunctions(), nameOrFindFunction);
        }

        getFunctionOrThrow(name: string): FunctionDeclaration;
        getFunctionOrThrow(findFunction: (declaration: FunctionDeclaration) => boolean): FunctionDeclaration;
        getFunctionOrThrow(nameOrFindFunction: string | ((declaration: FunctionDeclaration) => boolean)): FunctionDeclaration {
            return errors.throwIfNullOrUndefined(this.getFunction(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("function", nameOrFindFunction));
        }

        /* Interfaces */

        addInterface(structure: InterfaceDeclarationStructure) {
            return this.addInterfaces([structure])[0];
        }

        addInterfaces(structures: InterfaceDeclarationStructure[]) {
            return this.insertInterfaces(this.getCompilerStatements().length, structures);
        }

        insertInterface(index: number, structure: InterfaceDeclarationStructure) {
            return this.insertInterfaces(index, [structure])[0];
        }

        insertInterfaces(index: number, structures: InterfaceDeclarationStructure[]): InterfaceDeclaration[] {
            return this._insertChildren<InterfaceDeclaration, InterfaceDeclarationStructure>({
                expectedKind: SyntaxKind.InterfaceDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this.context.structurePrinterFactory.forInterfaceDeclaration().printTexts(writer, structures);
                    });
                }
            });
        }

        getInterfaces(): InterfaceDeclaration[] {
            // todo: remove type assertion
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.InterfaceDeclaration);
        }

        getInterface(name: string): InterfaceDeclaration | undefined;
        getInterface(findFunction: (declaration: InterfaceDeclaration) => boolean): InterfaceDeclaration | undefined;
        getInterface(nameOrFindFunction: string | ((declaration: InterfaceDeclaration) => boolean)): InterfaceDeclaration | undefined;
        getInterface(nameOrFindFunction: string | ((declaration: InterfaceDeclaration) => boolean)): InterfaceDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getInterfaces(), nameOrFindFunction);
        }

        getInterfaceOrThrow(name: string): InterfaceDeclaration;
        getInterfaceOrThrow(findFunction: (declaration: InterfaceDeclaration) => boolean): InterfaceDeclaration;
        getInterfaceOrThrow(nameOrFindFunction: string | ((declaration: InterfaceDeclaration) => boolean)): InterfaceDeclaration {
            return errors.throwIfNullOrUndefined(this.getInterface(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("interface", nameOrFindFunction));
        }

        /* Namespaces */

        addNamespace(structure: NamespaceDeclarationStructure) {
            return this.addNamespaces([structure])[0];
        }

        addNamespaces(structures: NamespaceDeclarationStructure[]) {
            return this.insertNamespaces(this.getCompilerStatements().length, structures);
        }

        insertNamespace(index: number, structure: NamespaceDeclarationStructure) {
            return this.insertNamespaces(index, [structure])[0];
        }

        insertNamespaces(index: number, structures: NamespaceDeclarationStructure[]): NamespaceDeclaration[] {
            return this._insertChildren<NamespaceDeclaration, NamespaceDeclarationStructure>({
                expectedKind: SyntaxKind.ModuleDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this.context.structurePrinterFactory.forNamespaceDeclaration({ isAmbient: isNodeAmbientOrInAmbientContext(this) }).printTexts(writer, structures);
                    });
                }
            });
        }

        getNamespaces(): NamespaceDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.ModuleDeclaration);
        }

        getNamespace(name: string): NamespaceDeclaration | undefined;
        getNamespace(findFunction: (declaration: NamespaceDeclaration) => boolean): NamespaceDeclaration | undefined;
        getNamespace(nameOrFindFunction: string | ((declaration: NamespaceDeclaration) => boolean)): NamespaceDeclaration | undefined;
        getNamespace(nameOrFindFunction: string | ((declaration: NamespaceDeclaration) => boolean)): NamespaceDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getNamespaces(), nameOrFindFunction);
        }

        getNamespaceOrThrow(name: string): NamespaceDeclaration;
        getNamespaceOrThrow(findFunction: (declaration: NamespaceDeclaration) => boolean): NamespaceDeclaration;
        getNamespaceOrThrow(nameOrFindFunction: string | ((declaration: NamespaceDeclaration) => boolean)): NamespaceDeclaration {
            return errors.throwIfNullOrUndefined(this.getNamespace(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("namespace", nameOrFindFunction));
        }

        /* Type aliases */

        addTypeAlias(structure: TypeAliasDeclarationStructure) {
            return this.addTypeAliases([structure])[0];
        }

        addTypeAliases(structures: TypeAliasDeclarationStructure[]) {
            return this.insertTypeAliases(this.getCompilerStatements().length, structures);
        }

        insertTypeAlias(index: number, structure: TypeAliasDeclarationStructure) {
            return this.insertTypeAliases(index, [structure])[0];
        }

        insertTypeAliases(index: number, structures: TypeAliasDeclarationStructure[]): TypeAliasDeclaration[] {
            return this._insertChildren<TypeAliasDeclaration, TypeAliasDeclarationStructure>({
                expectedKind: SyntaxKind.TypeAliasDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this.context.structurePrinterFactory.forTypeAliasDeclaration().printTexts(writer, structures);
                    }, {
                        previousNewLine: previousMember => TypeGuards.isTypeAliasDeclaration(previousMember),
                        nextNewLine: nextMember => TypeGuards.isTypeAliasDeclaration(nextMember)
                    });
                }
            });
        }

        getTypeAliases(): TypeAliasDeclaration[] {
            // todo: remove type assertion
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.TypeAliasDeclaration);
        }

        getTypeAlias(name: string): TypeAliasDeclaration | undefined;
        getTypeAlias(findFunction: (declaration: TypeAliasDeclaration) => boolean): TypeAliasDeclaration | undefined;
        getTypeAlias(nameOrFindFunction: string | ((declaration: TypeAliasDeclaration) => boolean)): TypeAliasDeclaration | undefined;
        getTypeAlias(nameOrFindFunction: string | ((declaration: TypeAliasDeclaration) => boolean)): TypeAliasDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getTypeAliases(), nameOrFindFunction);
        }

        getTypeAliasOrThrow(name: string): TypeAliasDeclaration;
        getTypeAliasOrThrow(findFunction: (declaration: TypeAliasDeclaration) => boolean): TypeAliasDeclaration;
        getTypeAliasOrThrow(nameOrFindFunction: string | ((declaration: TypeAliasDeclaration) => boolean)): TypeAliasDeclaration {
            return errors.throwIfNullOrUndefined(this.getTypeAlias(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("type alias", nameOrFindFunction));
        }

        /* Variable statements */

        getVariableStatements(): VariableStatement[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(SyntaxKind.VariableStatement);
        }

        getVariableStatement(findFunction: (declaration: VariableStatement) => boolean): VariableStatement | undefined {
            return ArrayUtils.find(this.getVariableStatements(), findFunction);
        }

        getVariableStatementOrThrow(findFunction: (declaration: VariableStatement) => boolean): VariableStatement {
            return errors.throwIfNullOrUndefined(this.getVariableStatement(findFunction), "Expected to find a variable statement that matched the provided condition.");
        }

        addVariableStatement(structure: VariableStatementStructure) {
            return this.addVariableStatements([structure])[0];
        }

        addVariableStatements(structures: VariableStatementStructure[]) {
            return this.insertVariableStatements(this.getCompilerStatements().length, structures);
        }

        insertVariableStatement(index: number, structure: VariableStatementStructure) {
            return this.insertVariableStatements(index, [structure])[0];
        }

        insertVariableStatements(index: number, structures: VariableStatementStructure[]): VariableStatement[] {
            return this._insertChildren<VariableStatement, VariableStatementStructure>({
                expectedKind: SyntaxKind.VariableStatement,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this.context.structurePrinterFactory.forVariableStatement().printTexts(writer, structures);
                    }, {
                        previousNewLine: previousMember => TypeGuards.isVariableStatement(previousMember),
                        nextNewLine: nextMember => TypeGuards.isVariableStatement(nextMember)
                    });
                }
            });
        }

        /* Variable declarations */

        getVariableDeclarations(): VariableDeclaration[] {
            const variables: VariableDeclaration[] = [];

            for (const list of this.getVariableStatements()) {
                variables.push(...list.getDeclarations());
            }

            return variables;
        }

        getVariableDeclaration(name: string): VariableDeclaration | undefined;
        getVariableDeclaration(findFunction: (declaration: VariableDeclaration) => boolean): VariableDeclaration | undefined;
        getVariableDeclaration(nameOrFindFunction: string | ((declaration: VariableDeclaration) => boolean)): VariableDeclaration | undefined;
        getVariableDeclaration(nameOrFindFunction: string | ((declaration: VariableDeclaration) => boolean)): VariableDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getVariableDeclarations(), nameOrFindFunction);
        }

        getVariableDeclarationOrThrow(name: string): VariableDeclaration;
        getVariableDeclarationOrThrow(findFunction: (declaration: VariableDeclaration) => boolean): VariableDeclaration;
        getVariableDeclarationOrThrow(nameOrFindFunction: string | ((declaration: VariableDeclaration) => boolean)): VariableDeclaration {
            return errors.throwIfNullOrUndefined(this.getVariableDeclaration(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("variable declaration", nameOrFindFunction));
        }

        fill(structure: Partial<StatementedNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.classes != null && structure.classes.length > 0)
                this.addClasses(structure.classes);
            if (structure.enums != null && structure.enums.length > 0)
                this.addEnums(structure.enums);
            if (structure.functions != null && structure.functions.length > 0)
                this.addFunctions(structure.functions);
            if (structure.interfaces != null && structure.interfaces.length > 0)
                this.addInterfaces(structure.interfaces);
            if (structure.namespaces != null && structure.namespaces.length > 0)
                this.addNamespaces(structure.namespaces);
            if (structure.typeAliases != null && structure.typeAliases.length > 0)
                this.addTypeAliases(structure.typeAliases);

            return this;
        }

        /**
         * @internal
         */
        private getCompilerStatements(): ts.NodeArray<ts.Statement> {
            if (TypeGuards.isSourceFile(this) || TypeGuards.isCaseClause(this) || TypeGuards.isDefaultClause(this))
                return this.compilerNode.statements;
            else if (TypeGuards.isNamespaceDeclaration(this)) {
                // need to get the inner-most body for namespaces
                let node = this as Node;
                while (TypeGuards.isBodiedNode(node) && (node.compilerNode as ts.Block).statements == null) {
                    node = node.getBody();
                }
                return (node.compilerNode as ts.Block).statements;
            }
            else if (TypeGuards.isBodyableNode(this))
                return (this.getBodyOrThrow().compilerNode as any).statements as ts.NodeArray<ts.Statement>;
            else if (TypeGuards.isBodiedNode(this))
                return (this.getBody().compilerNode as any).statements as ts.NodeArray<ts.Statement>;
            else if (TypeGuards.isBlock(this))
                return this.compilerNode.statements;
            else
                throw new errors.NotImplementedError(`Could not find the statements for node kind: ${this.getKindName()}, text: ${this.getText()}`);
        }

        _insertChildren<TNode extends Node, TStructure>(opts: InsertChildrenOptions<TStructure>) {
            return insertIntoBracesOrSourceFileWithGetChildren<TNode, TStructure>({
                expectedKind: opts.expectedKind,
                getIndexedChildren: () => this.getStatements(),
                index: opts.index,
                parent: this,
                structures: opts.structures,
                write: (writer, info) => opts.write(writer, info)
            });
        }

        _standardWrite(
            writer: CodeBlockWriter,
            info: InsertIntoBracesOrSourceFileOptionsWriteInfo,
            writeStructures: () => void,
            opts: StandardWriteOptions = {}
        ) {
            if (info.previousMember != null && (opts.previousNewLine == null || !opts.previousNewLine(info.previousMember)))
                writer.blankLine();
            else if (!info.isStartOfFile)
                writer.newLine();

            writeStructures();

            if (info.nextMember != null && (opts.nextNewLine == null || !opts.nextNewLine(info.nextMember)))
                writer.blankLine();
            else
                writer.newLine();
        }
    };
}
