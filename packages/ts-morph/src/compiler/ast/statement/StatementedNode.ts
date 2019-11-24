import { CodeBlockWriter } from "../../../codeBlockWriter";
import { errors, getSyntaxKindName, SyntaxKind, ts } from "@ts-morph/common";
import { InsertIntoBracesOrSourceFileOptionsWriteInfo, insertIntoBracesOrSourceFileWithGetChildren, removeStatementedNodeChildren,
    verifyAndGetIndex } from "../../../manipulation";
import { ClassDeclarationStructure, EnumDeclarationStructure, FunctionDeclarationStructure, InterfaceDeclarationStructure, NamespaceDeclarationStructure,
    StatementedNodeStructure, TypeAliasDeclarationStructure, VariableStatementStructure, StatementStructures, OptionalKind,
    Structure } from "../../../structures";
import { Constructor, WriterFunction } from "../../../types";
import { getNodeByNameOrFindFunction, nodeHasName, getNotFoundErrorMessageForNameOrFindFunction, isNodeAmbientOrInAmbientContext } from "../../../utils";
import { callBaseSet } from "../callBaseSet";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { ClassDeclaration } from "../class";
import { Node } from "../common";
import { EnumDeclaration } from "../enum";
import { FunctionDeclaration } from "../function";
import { InterfaceDeclaration } from "../interface";
import { ImplementedKindToNodeMappings } from "../kindToNodeMappings";
import { NamespaceDeclaration } from "../module";
import { Statement, VariableStatement, CommentStatement } from "../statement";
import { VariableDeclaration } from "../variable";
import { TypeAliasDeclaration } from "../type";
import { ExtendedParser, StatementContainerNodes } from "../utils";

export type StatementedNodeExtensionType = Node<ts.SourceFile | ts.FunctionDeclaration | ts.ModuleDeclaration | ts.FunctionLikeDeclaration | ts.CaseClause
    | ts.DefaultClause | ts.ModuleBlock>;

export interface KindToNodeMappingsWithCommentStatements extends ImplementedKindToNodeMappings {
    [kind: number]: Node;
    [SyntaxKind.SingleLineCommentTrivia]: CommentStatement;
    [SyntaxKind.MultiLineCommentTrivia]: CommentStatement;
}

export interface StatementedNode {
    /**
     * Gets the node's statements.
     */
    getStatements(): Statement[];
    /**
     * Gets the node's statements with comment statements.
     */
    getStatementsWithComments(): Statement[];
    /**
     * Gets the first statement that matches the provided condition or returns undefined if it doesn't exist.
     * @param findFunction - Function to find the statement by.
     */
    getStatement<T extends Statement>(findFunction: (statement: Statement) => statement is T): T | undefined;
    /**
     * Gets the first statement that matches the provided condition or returns undefined if it doesn't exist.
     * @param findFunction - Function to find the statement by.
     */
    getStatement(findFunction: (statement: Statement) => boolean): Statement | undefined;
    /**
     * Gets the first statement that matches the provided condition or throws if it doesn't exist.
     * @param findFunction - Function to find the statement by.
     */
    getStatementOrThrow<T extends Statement>(findFunction: (statement: Statement) => statement is T): T;
    /**
     * Gets the first statement that matches the provided condition or throws if it doesn't exist.
     * @param findFunction - Function to find the statement by.
     */
    getStatementOrThrow(findFunction: (statement: Statement) => boolean): Statement;
    /**
     * Gets the first statement that matches the provided syntax kind or returns undefined if it doesn't exist.
     * @param kind - Syntax kind to find the node by.
     */
    getStatementByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappingsWithCommentStatements[TKind] | undefined;
    /**
     * Gets the first statement that matches the provided syntax kind or throws if it doesn't exist.
     * @param kind - Syntax kind to find the node by.
     */
    getStatementByKindOrThrow<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappingsWithCommentStatements[TKind];
    /**
     * Add statements.
     * @param statements - statements to add.
     * @returns The statements that were added.
     */
    addStatements(statements: string | WriterFunction | ReadonlyArray<string | WriterFunction | StatementStructures>): Statement[];
    /**
     * Inserts statements at the specified index.
     * @param index - Child index to insert at.
     * @param statements - Statements to insert.
     * @returns The statements that were inserted.
     */
    insertStatements(index: number, statements: string | WriterFunction | ReadonlyArray<string | WriterFunction | StatementStructures>): Statement[];
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
    addClass(structure: OptionalKind<ClassDeclarationStructure>): ClassDeclaration;
    /**
     * Adds class declarations as a child.
     * @param structures - Structures of the class declarations to add.
     */
    addClasses(structures: ReadonlyArray<OptionalKind<ClassDeclarationStructure>>): ClassDeclaration[];
    /**
     * Inserts an class declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the class declaration to insert.
     */
    insertClass(index: number, structure: OptionalKind<ClassDeclarationStructure>): ClassDeclaration;
    /**
     * Inserts class declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the class declarations to insert.
     */
    insertClasses(index: number, structures: ReadonlyArray<OptionalKind<ClassDeclarationStructure>>): ClassDeclaration[];
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
    addEnum(structure: OptionalKind<EnumDeclarationStructure>): EnumDeclaration;
    /**
     * Adds enum declarations as a child.
     * @param structures - Structures of the enum declarations to add.
     */
    addEnums(structures: ReadonlyArray<OptionalKind<EnumDeclarationStructure>>): EnumDeclaration[];
    /**
     * Inserts an enum declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the enum declaration to insert.
     */
    insertEnum(index: number, structure: OptionalKind<EnumDeclarationStructure>): EnumDeclaration;
    /**
     * Inserts enum declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the enum declarations to insert.
     */
    insertEnums(index: number, structures: ReadonlyArray<OptionalKind<EnumDeclarationStructure>>): EnumDeclaration[];
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
    addFunction(structure: OptionalKind<FunctionDeclarationStructure>): FunctionDeclaration;
    /**
     * Adds function declarations as a child.
     * @param structures - Structures of the function declarations to add.
     */
    addFunctions(structures: ReadonlyArray<OptionalKind<FunctionDeclarationStructure>>): FunctionDeclaration[];
    /**
     * Inserts an function declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the function declaration to insert.
     */
    insertFunction(index: number, structure: OptionalKind<FunctionDeclarationStructure>): FunctionDeclaration;
    /**
     * Inserts function declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the function declarations to insert.
     */
    insertFunctions(index: number, structures: ReadonlyArray<OptionalKind<FunctionDeclarationStructure>>): FunctionDeclaration[];
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
    addInterface(structure: OptionalKind<InterfaceDeclarationStructure>): InterfaceDeclaration;
    /**
     * Adds interface declarations as a child.
     * @param structures - Structures of the interface declarations to add.
     */
    addInterfaces(structures: ReadonlyArray<OptionalKind<InterfaceDeclarationStructure>>): InterfaceDeclaration[];
    /**
     * Inserts an interface declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the interface declaration to insert.
     */
    insertInterface(index: number, structure: OptionalKind<InterfaceDeclarationStructure>): InterfaceDeclaration;
    /**
     * Inserts interface declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the interface declarations to insert.
     */
    insertInterfaces(index: number, structures: ReadonlyArray<OptionalKind<InterfaceDeclarationStructure>>): InterfaceDeclaration[];
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
    addNamespace(structure: OptionalKind<NamespaceDeclarationStructure>): NamespaceDeclaration;
    /**
     * Adds namespace declarations as a child.
     * @param structures - Structures of the namespace declarations to add.
     */
    addNamespaces(structures: ReadonlyArray<OptionalKind<NamespaceDeclarationStructure>>): NamespaceDeclaration[];
    /**
     * Inserts an namespace declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the namespace declaration to insert.
     */
    insertNamespace(index: number, structure: OptionalKind<NamespaceDeclarationStructure>): NamespaceDeclaration;
    /**
     * Inserts namespace declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the namespace declarations to insert.
     */
    insertNamespaces(index: number, structures: ReadonlyArray<OptionalKind<NamespaceDeclarationStructure>>): NamespaceDeclaration[];
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
    addTypeAlias(structure: OptionalKind<TypeAliasDeclarationStructure>): TypeAliasDeclaration;
    /**
     * Adds type alias declarations as a child.
     * @param structures - Structures of the type alias declarations to add.
     */
    addTypeAliases(structures: ReadonlyArray<OptionalKind<TypeAliasDeclarationStructure>>): TypeAliasDeclaration[];
    /**
     * Inserts an type alias declaration as a child.
     * @param index - Child index to insert at.
     * @param structure - Structure of the type alias declaration to insert.
     */
    insertTypeAlias(index: number, structure: OptionalKind<TypeAliasDeclarationStructure>): TypeAliasDeclaration;
    /**
     * Inserts type alias declarations as a child.
     * @param index - Child index to insert at.
     * @param structures - Structures of the type alias declarations to insert.
     */
    insertTypeAliases(index: number, structures: ReadonlyArray<OptionalKind<TypeAliasDeclarationStructure>>): TypeAliasDeclaration[];
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
    addVariableStatement(structure: OptionalKind<VariableStatementStructure>): VariableStatement;
    /**
     * Adds variable statements.
     * @param structures - Structures of the variable statements.
     */
    addVariableStatements(structures: ReadonlyArray<OptionalKind<VariableStatementStructure>>): VariableStatement[];
    /**
     * Inserts a variable statement.
     * @param structure - Structure of the variable statement.
     */
    insertVariableStatement(index: number, structure: OptionalKind<VariableStatementStructure>): VariableStatement;
    /**
     * Inserts variable statements.
     * @param structures - Structures of the variable statements.
     */
    insertVariableStatements(index: number, structures: ReadonlyArray<OptionalKind<VariableStatementStructure>>): VariableStatement[];
    /**
     * Gets the direct variable statement children.
     */
    getVariableStatements(): VariableStatement[];
    /**
     * Gets a variable statement.
     * @param name - Name of one of the variable statement's declarations.
     */
    getVariableStatement(name: string): VariableStatement | undefined;
    /**
     * Gets a variable statement.
     * @param findFunction - Function to use to find the variable statement.
     */
    getVariableStatement(findFunction: (declaration: VariableStatement) => boolean): VariableStatement | undefined;
    /** @internal */
    getVariableStatement(nameOrFindFunction: string | ((declaration: VariableStatement) => boolean)): VariableStatement | undefined;
    /**
     * Gets a variable statement or throws if it doesn't exist.
     * @param name - Name of one of the variable statement's declarations.
     */
    getVariableStatementOrThrow(name: string): VariableStatement;
    /**
     * Gets a variable statement or throws if it doesn't exist.
     * @param findFunction - Function to use to find the variable statement.
     */
    getVariableStatementOrThrow(findFunction: (declaration: VariableStatement) => boolean): VariableStatement;
    /** @internal */
    getVariableStatementOrThrow(nameOrFindFunction: string | ((declaration: VariableStatement) => boolean)): VariableStatement;
    /**
     * Gets all the variable declarations within the variable statement children.
     * @remarks This does not return the variable declarations within for statements or for of statements.
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
    _insertChildren<TNode extends Node>(opts: InsertChildrenOptions): TNode[];
    /** @internal */
    _standardWrite(
        writer: CodeBlockWriter,
        info: InsertIntoBracesOrSourceFileOptionsWriteInfo,
        writeStructures: () => void,
        opts?: StandardWriteOptions
    ): void;
    /** @internal */
    _getCompilerStatementsWithComments(): ts.Statement[];
}

/** @internal */
export interface InsertChildrenOptions {
    expectedKind: SyntaxKind;
    index: number;
    structures: ReadonlyArray<Structure>;
    write: (writer: CodeBlockWriter, info: InsertIntoBracesOrSourceFileOptionsWriteInfo) => void;
}

/** @internal */
export interface StandardWriteOptions {
    previousNewLine?: (previousMember: Node) => boolean;
    nextNewLine?: (nextMember: Node) => boolean;
}

export function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T {
    return class extends Base implements StatementedNode {
        /* General */
        getStatements() {
            const statementsContainer = this._getCompilerStatementsContainer();
            const statements = (statementsContainer?.statements as any as ts.Statement[]) ?? [] as ts.Statement[];
            return statements.map(s => this._getNodeFromCompilerNode(s));
        }

        getStatementsWithComments() {
            return this._getCompilerStatementsWithComments().map(s => this._getNodeFromCompilerNode(s));
        }

        getStatement(findFunction: (statement: Statement) => boolean) {
            return this.getStatements().find(findFunction);
        }

        getStatementOrThrow(findFunction: (statement: Statement) => boolean) {
            return errors.throwIfNullOrUndefined(this.getStatement(findFunction), "Expected to find a statement matching the provided condition.");
        }

        getStatementByKind<TKind extends SyntaxKind>(kind: TKind): KindToNodeMappingsWithCommentStatements[TKind] | undefined {
            const statement = this._getCompilerStatementsWithComments().find(s => s.kind === kind);
            return this._getNodeFromCompilerNodeIfExists(statement) as KindToNodeMappingsWithCommentStatements[TKind] | undefined;
        }

        getStatementByKindOrThrow<TKind extends SyntaxKind>(kind: TKind) {
            return errors.throwIfNullOrUndefined(this.getStatementByKind(kind), `Expected to find a statement with syntax kind ${getSyntaxKindName(kind)}.`);
        }

        addStatements(textOrWriterFunction: string | WriterFunction | ReadonlyArray<string | WriterFunction | StatementStructures>) {
            return this.insertStatements(this._getCompilerStatementsWithComments().length, textOrWriterFunction);
        }

        insertStatements(index: number, statements: string | WriterFunction | ReadonlyArray<string | WriterFunction | StatementStructures>) {
            addBodyIfNotExists(this);
            const writerFunction = (writer: CodeBlockWriter) => {
                const statementsPrinter = this._context.structurePrinterFactory.forStatement({ isAmbient: isNodeAmbientOrInAmbientContext(this) });
                statementsPrinter.printTexts(writer, statements);
            };

            return getChildSyntaxList.call(this).insertChildText(index, writerFunction) as Statement[];

            function getChildSyntaxList(this: Node) {
                const childSyntaxList = this.getChildSyntaxListOrThrow();

                // case and default clauses can optionally have blocks
                if (Node.isCaseClause(this) || Node.isDefaultClause(this)) {
                    const block = childSyntaxList.getFirstChildIfKind(SyntaxKind.Block);
                    if (block != null)
                        return block.getChildSyntaxListOrThrow();
                }

                return childSyntaxList;
            }
        }

        removeStatement(index: number) {
            index = verifyAndGetIndex(index, this._getCompilerStatementsWithComments().length - 1);
            return this.removeStatements([index, index]);
        }

        removeStatements(indexRange: [number, number]) {
            const statements = this.getStatementsWithComments();
            errors.throwIfRangeOutOfRange(indexRange, [0, statements.length], nameof(indexRange));

            removeStatementedNodeChildren(statements.slice(indexRange[0], indexRange[1] + 1));

            return this;
        }

        /* Classes */

        addClass(structure: OptionalKind<ClassDeclarationStructure>) {
            return this.addClasses([structure])[0];
        }

        addClasses(structures: ReadonlyArray<OptionalKind<ClassDeclarationStructure>>) {
            return this.insertClasses(this._getCompilerStatementsWithComments().length, structures);
        }

        insertClass(index: number, structure: OptionalKind<ClassDeclarationStructure>) {
            return this.insertClasses(index, [structure])[0];
        }

        insertClasses(index: number, structures: ReadonlyArray<OptionalKind<ClassDeclarationStructure>>): ClassDeclaration[] {
            return this._insertChildren<ClassDeclaration>({
                expectedKind: SyntaxKind.ClassDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this._context.structurePrinterFactory.forClassDeclaration({ isAmbient: isNodeAmbientOrInAmbientContext(this) })
                            .printTexts(writer, structures);
                    });
                }
            });
        }

        getClasses(): ClassDeclaration[] {
            return this.getStatements().filter(Node.isClassDeclaration);
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
            return errors.throwIfNullOrUndefined(
                this.getClass(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("class", nameOrFindFunction)
            );
        }

        /* Enums */

        addEnum(structure: OptionalKind<EnumDeclarationStructure>) {
            return this.addEnums([structure])[0];
        }

        addEnums(structures: ReadonlyArray<OptionalKind<EnumDeclarationStructure>>) {
            return this.insertEnums(this._getCompilerStatementsWithComments().length, structures);
        }

        insertEnum(index: number, structure: OptionalKind<EnumDeclarationStructure>) {
            return this.insertEnums(index, [structure])[0];
        }

        insertEnums(index: number, structures: ReadonlyArray<OptionalKind<EnumDeclarationStructure>>): EnumDeclaration[] {
            return this._insertChildren<EnumDeclaration>({
                expectedKind: SyntaxKind.EnumDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this._context.structurePrinterFactory.forEnumDeclaration().printTexts(writer, structures);
                    });
                }
            });
        }

        getEnums(): EnumDeclaration[] {
            return this.getStatements().filter(Node.isEnumDeclaration);
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
            return errors.throwIfNullOrUndefined(
                this.getEnum(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("enum", nameOrFindFunction)
            );
        }

        /* Functions */

        addFunction(structure: OptionalKind<FunctionDeclarationStructure>) {
            return this.addFunctions([structure])[0];
        }

        addFunctions(structures: ReadonlyArray<OptionalKind<FunctionDeclarationStructure>>) {
            return this.insertFunctions(this._getCompilerStatementsWithComments().length, structures);
        }

        insertFunction(index: number, structure: OptionalKind<FunctionDeclarationStructure>) {
            return this.insertFunctions(index, [structure])[0];
        }

        insertFunctions(index: number, structures: ReadonlyArray<OptionalKind<FunctionDeclarationStructure>>): FunctionDeclaration[] {
            return this._insertChildren<FunctionDeclaration>({
                expectedKind: SyntaxKind.FunctionDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this._context.structurePrinterFactory.forFunctionDeclaration({
                            isAmbient: isNodeAmbientOrInAmbientContext(this)
                        }).printTexts(writer, structures);
                    }, {
                        previousNewLine: previousMember => structures[0].hasDeclareKeyword === true
                            && Node.isFunctionDeclaration(previousMember)
                            && previousMember.getBody() == null,
                        nextNewLine: nextMember => structures[structures.length - 1].hasDeclareKeyword === true
                            && Node.isFunctionDeclaration(nextMember)
                            && nextMember.getBody() == null
                    });
                }
            });
        }

        getFunctions(): FunctionDeclaration[] {
            return this.getStatements().filter(Node.isFunctionDeclaration).filter(f => f.isAmbient() || f.isImplementation());
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
            return errors.throwIfNullOrUndefined(
                this.getFunction(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("function", nameOrFindFunction)
            );
        }

        /* Interfaces */

        addInterface(structure: OptionalKind<InterfaceDeclarationStructure>) {
            return this.addInterfaces([structure])[0];
        }

        addInterfaces(structures: ReadonlyArray<OptionalKind<InterfaceDeclarationStructure>>) {
            return this.insertInterfaces(this._getCompilerStatementsWithComments().length, structures);
        }

        insertInterface(index: number, structure: OptionalKind<InterfaceDeclarationStructure>) {
            return this.insertInterfaces(index, [structure])[0];
        }

        insertInterfaces(index: number, structures: ReadonlyArray<OptionalKind<InterfaceDeclarationStructure>>): InterfaceDeclaration[] {
            return this._insertChildren<InterfaceDeclaration>({
                expectedKind: SyntaxKind.InterfaceDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this._context.structurePrinterFactory.forInterfaceDeclaration().printTexts(writer, structures);
                    });
                }
            });
        }

        getInterfaces(): InterfaceDeclaration[] {
            return this.getStatements().filter(Node.isInterfaceDeclaration);
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
            return errors.throwIfNullOrUndefined(
                this.getInterface(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("interface", nameOrFindFunction)
            );
        }

        /* Namespaces */

        addNamespace(structure: OptionalKind<NamespaceDeclarationStructure>) {
            return this.addNamespaces([structure])[0];
        }

        addNamespaces(structures: ReadonlyArray<OptionalKind<NamespaceDeclarationStructure>>) {
            return this.insertNamespaces(this._getCompilerStatementsWithComments().length, structures);
        }

        insertNamespace(index: number, structure: OptionalKind<NamespaceDeclarationStructure>) {
            return this.insertNamespaces(index, [structure])[0];
        }

        insertNamespaces(index: number, structures: ReadonlyArray<OptionalKind<NamespaceDeclarationStructure>>): NamespaceDeclaration[] {
            return this._insertChildren<NamespaceDeclaration>({
                expectedKind: SyntaxKind.ModuleDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this._context.structurePrinterFactory.forNamespaceDeclaration({ isAmbient: isNodeAmbientOrInAmbientContext(this) })
                            .printTexts(writer, structures);
                    });
                }
            });
        }

        getNamespaces(): NamespaceDeclaration[] {
            return this.getStatements().filter(Node.isNamespaceDeclaration);
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
            return errors.throwIfNullOrUndefined(
                this.getNamespace(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("namespace", nameOrFindFunction)
            );
        }

        /* Type aliases */

        addTypeAlias(structure: OptionalKind<TypeAliasDeclarationStructure>) {
            return this.addTypeAliases([structure])[0];
        }

        addTypeAliases(structures: ReadonlyArray<OptionalKind<TypeAliasDeclarationStructure>>) {
            return this.insertTypeAliases(this._getCompilerStatementsWithComments().length, structures);
        }

        insertTypeAlias(index: number, structure: OptionalKind<TypeAliasDeclarationStructure>) {
            return this.insertTypeAliases(index, [structure])[0];
        }

        insertTypeAliases(index: number, structures: ReadonlyArray<OptionalKind<TypeAliasDeclarationStructure>>): TypeAliasDeclaration[] {
            return this._insertChildren<TypeAliasDeclaration>({
                expectedKind: SyntaxKind.TypeAliasDeclaration,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this._context.structurePrinterFactory.forTypeAliasDeclaration().printTexts(writer, structures);
                    }, {
                        previousNewLine: previousMember => Node.isTypeAliasDeclaration(previousMember),
                        nextNewLine: nextMember => Node.isTypeAliasDeclaration(nextMember)
                    });
                }
            });
        }

        getTypeAliases(): TypeAliasDeclaration[] {
            return this.getStatements().filter(Node.isTypeAliasDeclaration);
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
            return errors.throwIfNullOrUndefined(
                this.getTypeAlias(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("type alias", nameOrFindFunction)
            );
        }

        /* Variable statements */

        getVariableStatements(): VariableStatement[] {
            return this.getStatements().filter(Node.isVariableStatement);
        }

        getVariableStatement(nameOrFindFunction: string | ((statement: VariableStatement) => boolean)): VariableStatement | undefined {
            return this.getVariableStatements().find(getFindFunction());

            function getFindFunction() {
                if (typeof nameOrFindFunction === "string")
                    return (statement: VariableStatement) => statement.getDeclarations().some(d => nodeHasName(d, nameOrFindFunction));
                return nameOrFindFunction;
            }
        }

        getVariableStatementOrThrow(nameOrFindFunction: string | ((statement: VariableStatement) => boolean)): VariableStatement {
            return errors.throwIfNullOrUndefined(
                this.getVariableStatement(nameOrFindFunction),
                "Expected to find a variable statement that matched the provided condition."
            );
        }

        addVariableStatement(structure: OptionalKind<VariableStatementStructure>) {
            return this.addVariableStatements([structure])[0];
        }

        addVariableStatements(structures: ReadonlyArray<OptionalKind<VariableStatementStructure>>) {
            return this.insertVariableStatements(this._getCompilerStatementsWithComments().length, structures);
        }

        insertVariableStatement(index: number, structure: OptionalKind<VariableStatementStructure>) {
            return this.insertVariableStatements(index, [structure])[0];
        }

        insertVariableStatements(index: number, structures: ReadonlyArray<OptionalKind<VariableStatementStructure>>): VariableStatement[] {
            return this._insertChildren<VariableStatement>({
                expectedKind: SyntaxKind.VariableStatement,
                index,
                structures,
                write: (writer, info) => {
                    this._standardWrite(writer, info, () => {
                        this._context.structurePrinterFactory.forVariableStatement().printTexts(writer, structures);
                    }, {
                        previousNewLine: previousMember => Node.isVariableStatement(previousMember),
                        nextNewLine: nextMember => Node.isVariableStatement(nextMember)
                    });
                }
            });
        }

        /* Variable declarations */

        getVariableDeclarations(): VariableDeclaration[] {
            const variables: VariableDeclaration[] = [];

            for (const list of this.getVariableStatements())
                variables.push(...list.getDeclarations());

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

        getStructure() {
            const structure: Pick<StatementedNodeStructure, "statements"> = {};
            if (Node.isBodyableNode(this) && !this.hasBody())
                structure.statements = undefined;
            else {
                structure.statements = this.getStatements().map(s => {
                    if (Node._hasStructure(s))
                        return s.getStructure() as any; // todo: resolve this
                    return s.getText({ trimLeadingIndentation: true });
                });
            }

            return callBaseGetStructure<any>(Base.prototype, this, structure);
        }

        set(structure: Partial<StatementedNodeStructure>) {
            // todo: I don't think it's necessary to do this in two steps anymore and this could probably
            // be changed to set the body text in one go instead (for performance reasons)
            if (Node.isBodyableNode(this) && structure.statements == null && structure.hasOwnProperty(nameof(structure.statements)))
                this.removeBody();
            else if (structure.statements != null) {
                const statementCount = this._getCompilerStatementsWithComments().length;
                if (statementCount > 0)
                    this.removeStatements([0, statementCount - 1]);
            }

            callBaseSet(Base.prototype, this, structure);

            // add the text after if necessary
            if (structure.statements != null)
                this.addStatements(structure.statements);

            return this;
        }

        _getCompilerStatementsWithComments(): ts.Statement[] {
            const statementsContainer = this._getCompilerStatementsContainer();
            if (statementsContainer == null)
                return [] as any as ts.Statement[];
            else {
                // will always return an array of statements
                return ExtendedParser.getContainerArray(statementsContainer, this._sourceFile.compilerNode) as any as ts.Statement[];
            }
        }

        _getCompilerStatementsContainer(): StatementContainerNodes | undefined {
            if (Node.isSourceFile(this) || Node.isCaseClause(this) || Node.isDefaultClause(this))
                return this.compilerNode;
            else if (Node.isNamespaceDeclaration(this)) {
                // need to get the inner-most body for namespaces
                return (this._getInnerBody().compilerNode as ts.Block);
            }
            else if (Node.isBodyableNode(this) || Node.isBodiedNode(this))
                return (this.getBody()?.compilerNode as any);
            else if (Node.isBlock(this) || Node.isModuleBlock(this))
                return this.compilerNode;
            else
                throw new errors.NotImplementedError(`Could not find the statements for node kind: ${this.getKindName()}, text: ${this.getText()}`);
        }

        _insertChildren<TNode extends Node>(opts: InsertChildrenOptions) {
            addBodyIfNotExists(this);

            return insertIntoBracesOrSourceFileWithGetChildren<TNode>({
                expectedKind: opts.expectedKind,
                getIndexedChildren: () => this.getStatementsWithComments(),
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
                writer.newLineIfLastNot();

            writeStructures();

            if (info.nextMember != null && (opts.nextNewLine == null || !opts.nextNewLine(info.nextMember)))
                writer.blankLine();
            else
                writer.newLineIfLastNot();
        }
    };
}

function addBodyIfNotExists(node: Node) {
    if (Node.isBodyableNode(node) && !node.hasBody())
        node.addBody();
}
