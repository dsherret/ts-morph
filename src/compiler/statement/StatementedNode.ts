import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {ClassDeclarationStructure, InterfaceDeclarationStructure, TypeAliasDeclarationStructure, FunctionDeclarationStructure,
    EnumDeclarationStructure, NamespaceDeclarationStructure, StatementedNodeStructure, VariableStatementStructure} from "./../../structures";
import {verifyAndGetIndex, insertIntoBracesOrSourceFile, getRangeFromArray} from "./../../manipulation";
import {getNamedNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction, using, TypeGuards} from "./../../utils";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import * as classes from "./../class";
import * as enums from "./../enum";
import * as functions from "./../function";
import * as interfaces from "./../interface";
import * as namespaces from "./../namespace";
import * as types from "./../type";
import * as statement from "./../statement";
import {VariableDeclarationType} from "./VariableDeclarationType";

export type StatementedNodeExtensionType = Node<ts.SourceFile | ts.FunctionDeclaration | ts.ModuleDeclaration | ts.FunctionLikeDeclaration>;

export interface StatementedNode {
    /**
     * Gets the node's statements.
     */
    getStatements(): Node[];
    /**
     * Adds an class declaration as a child.
     * @param structure - Structure of the class declaration to add.
     */
    addClass(structure: ClassDeclarationStructure): classes.ClassDeclaration;
    /**
     * Adds class declarations as a child.
     * @param structures - Structures of the class declarations to add.
     */
    addClasses(structures: ClassDeclarationStructure[]): classes.ClassDeclaration[];
    /**
     * Inserts an class declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the class declaration to insert.
     */
    insertClass(index: number, structure: ClassDeclarationStructure): classes.ClassDeclaration;
    /**
     * Inserts class declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the class declarations to insert.
     */
    insertClasses(index: number, structures: ClassDeclarationStructure[]): classes.ClassDeclaration[];
    /**
     * Gets the direct class declaration children.
     */
    getClasses(): classes.ClassDeclaration[];
    /**
     * Gets a class.
     * @param name - Name of the class.
     */
    getClass(name: string): classes.ClassDeclaration | undefined;
    /**
     * Gets a class.
     * @param findFunction - Function to use to find the class.
     */
    getClass(findFunction: (declaration: classes.ClassDeclaration) => boolean): classes.ClassDeclaration | undefined;
    /**
     * Gets a class or throws if it doesn't exist.
     * @param name - Name of the class.
     */
    getClassOrThrow(name: string): classes.ClassDeclaration;
    /**
     * Gets a class or throws if it doesn't exist.
     * @param findFunction - Function to use to find the class.
     */
    getClassOrThrow(findFunction: (declaration: classes.ClassDeclaration) => boolean): classes.ClassDeclaration;
    /**
     * Adds an enum declaration as a child.
     * @param structure - Structure of the enum declaration to add.
     */
    addEnum(structure: EnumDeclarationStructure): enums.EnumDeclaration;
    /**
     * Adds enum declarations as a child.
     * @param structures - Structures of the enum declarations to add.
     */
    addEnums(structures: EnumDeclarationStructure[]): enums.EnumDeclaration[];
    /**
     * Inserts an enum declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the enum declaration to insert.
     */
    insertEnum(index: number, structure: EnumDeclarationStructure): enums.EnumDeclaration;
    /**
     * Inserts enum declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the enum declarations to insert.
     */
    insertEnums(index: number, structures: EnumDeclarationStructure[]): enums.EnumDeclaration[];
    /**
     * Gets the direct enum declaration children.
     */
    getEnums(): enums.EnumDeclaration[];
    /**
     * Gets an enum.
     * @param name - Name of the enum.
     */
    getEnum(name: string): enums.EnumDeclaration | undefined;
    /**
     * Gets an enum.
     * @param findFunction - Function to use to find the enum.
     */
    getEnum(findFunction: (declaration: enums.EnumDeclaration) => boolean): enums.EnumDeclaration | undefined;
    /**
     * Gets an enum or throws if it doesn't exist.
     * @param name - Name of the enum.
     */
    getEnumOrThrow(name: string): enums.EnumDeclaration;
    /**
     * Gets an enum or throws if it doesn't exist.
     * @param findFunction - Function to use to find the enum.
     */
    getEnumOrThrow(findFunction: (declaration: enums.EnumDeclaration) => boolean): enums.EnumDeclaration;
    /**
     * Adds a function declaration as a child.
     * @param structure - Structure of the function declaration to add.
     */
    addFunction(structure: FunctionDeclarationStructure): functions.FunctionDeclaration;
    /**
     * Adds function declarations as a child.
     * @param structures - Structures of the function declarations to add.
     */
    addFunctions(structures: FunctionDeclarationStructure[]): functions.FunctionDeclaration[];
    /**
     * Inserts an function declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the function declaration to insert.
     */
    insertFunction(index: number, structure: FunctionDeclarationStructure): functions.FunctionDeclaration;
    /**
     * Inserts function declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the function declarations to insert.
     */
    insertFunctions(index: number, structures: FunctionDeclarationStructure[]): functions.FunctionDeclaration[];
    /**
     * Gets the direct function declaration children.
     */
    getFunctions(): functions.FunctionDeclaration[];
    /**
     * Gets a function.
     * @param name - Name of the function.
     */
    getFunction(name: string): functions.FunctionDeclaration | undefined;
    /**
     * Gets a function.
     * @param findFunction - Function to use to find the function.
     */
    getFunction(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration | undefined;
    /**
     * Gets a function or throws if it doesn't exist.
     * @param name - Name of the function.
     */
    getFunctionOrThrow(name: string): functions.FunctionDeclaration;
    /**
     * Gets a function or throws if it doesn't exist.
     * @param findFunction - Function to use to find the function.
     */
    getFunctionOrThrow(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration;
    /**
     * Adds a interface declaration as a child.
     * @param structure - Structure of the interface declaration to add.
     */
    addInterface(structure: InterfaceDeclarationStructure): interfaces.InterfaceDeclaration;
    /**
     * Adds interface declarations as a child.
     * @param structures - Structures of the interface declarations to add.
     */
    addInterfaces(structures: InterfaceDeclarationStructure[]): interfaces.InterfaceDeclaration[];
    /**
     * Inserts an interface declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the interface declaration to insert.
     */
    insertInterface(index: number, structure: InterfaceDeclarationStructure): interfaces.InterfaceDeclaration;
    /**
     * Inserts interface declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the interface declarations to insert.
     */
    insertInterfaces(index: number, structures: InterfaceDeclarationStructure[]): interfaces.InterfaceDeclaration[];
    /**
     * Gets the direct interface declaration children.
     */
    getInterfaces(): interfaces.InterfaceDeclaration[];
    /**
     * Gets an interface.
     * @param name - Name of the interface.
     */
    getInterface(name: string): interfaces.InterfaceDeclaration | undefined;
    /**
     * Gets an interface.
     * @param findFunction - Function to use to find the interface.
     */
    getInterface(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration | undefined;
    /**
     * Gets an interface or throws if it doesn't exist.
     * @param name - Name of the interface.
     */
    getInterfaceOrThrow(name: string): interfaces.InterfaceDeclaration;
    /**
     * Gets an interface or throws if it doesn't exist.
     * @param findFunction - Function to use to find the interface.
     */
    getInterfaceOrThrow(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration;
    /**
     * Adds a namespace declaration as a child.
     * @param structure - Structure of the namespace declaration to add.
     */
    addNamespace(structure: NamespaceDeclarationStructure): namespaces.NamespaceDeclaration;
    /**
     * Adds namespace declarations as a child.
     * @param structures - Structures of the namespace declarations to add.
     */
    addNamespaces(structures: NamespaceDeclarationStructure[]): namespaces.NamespaceDeclaration[];
    /**
     * Inserts an namespace declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the namespace declaration to insert.
     */
    insertNamespace(index: number, structure: NamespaceDeclarationStructure): namespaces.NamespaceDeclaration;
    /**
     * Inserts namespace declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the namespace declarations to insert.
     */
    insertNamespaces(index: number, structures: NamespaceDeclarationStructure[]): namespaces.NamespaceDeclaration[];
    /**
     * Gets the direct namespace declaration children.
     */
    getNamespaces(): namespaces.NamespaceDeclaration[];
    /**
     * Gets a namespace.
     * @param name - Name of the namespace.
     */
    getNamespace(name: string): namespaces.NamespaceDeclaration | undefined;
    /**
     * Gets a namespace.
     * @param findFunction - Function to use to find the namespace.
     */
    getNamespace(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration | undefined;
    /**
     * Gets a namespace or throws if it doesn't exist.
     * @param name - Name of the namespace.
     */
    getNamespaceOrThrow(name: string): namespaces.NamespaceDeclaration;
    /**
     * Gets a namespace or throws if it doesn't exist.
     * @param findFunction - Function to use to find the namespace.
     */
    getNamespaceOrThrow(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration;
    /**
     * Adds a type alias declaration as a child.
     * @param structure - Structure of the type alias declaration to add.
     */
    addTypeAlias(structure: TypeAliasDeclarationStructure): types.TypeAliasDeclaration;
    /**
     * Adds type alias declarations as a child.
     * @param structures - Structures of the type alias declarations to add.
     */
    addTypeAliases(structures: TypeAliasDeclarationStructure[]): types.TypeAliasDeclaration[];
    /**
     * Inserts an type alias declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the type alias declaration to insert.
     */
    insertTypeAlias(index: number, structure: TypeAliasDeclarationStructure): types.TypeAliasDeclaration;
    /**
     * Inserts type alias declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the type alias declarations to insert.
     */
    insertTypeAliases(index: number, structures: TypeAliasDeclarationStructure[]): types.TypeAliasDeclaration[];
    /**
     * Gets the direct type alias declaration children.
     */
    getTypeAliases(): types.TypeAliasDeclaration[];
    /**
     * Gets a type alias.
     * @param name - Name of the type alias.
     */
    getTypeAlias(name: string): types.TypeAliasDeclaration | undefined;
    /**
     * Gets a type alias.
     * @param findFunction - Function to use to find the type alias.
     */
    getTypeAlias(findFunction: (declaration: types.TypeAliasDeclaration) => boolean): types.TypeAliasDeclaration | undefined;
    /**
     * Gets a type alias or throws if it doesn't exist.
     * @param name - Name of the type alias.
     */
    getTypeAliasOrThrow(name: string): types.TypeAliasDeclaration;
    /**
     * Gets a type alias or throws if it doesn't exist.
     * @param findFunction - Function to use to find the type alias.
     */
    getTypeAliasOrThrow(findFunction: (declaration: types.TypeAliasDeclaration) => boolean): types.TypeAliasDeclaration;

    /**
     * Adds a variable statement.
     * @param structure - Structure of the variable statement.
     */
    addVariableStatement(structure: VariableStatementStructure): statement.VariableStatement;
    /**
     * Adds variable statements.
     * @param structures - Structures of the variable statements.
     */
    addVariableStatements(structures: VariableStatementStructure[]): statement.VariableStatement[];
    /**
     * Inserts a variable statement.
     * @param structure - Structure of the variable statement.
     */
    insertVariableStatement(index: number, structure: VariableStatementStructure): statement.VariableStatement;
    /**
     * Inserts variable statements.
     * @param structures - Structures of the variable statements.
     */
    insertVariableStatements(index: number, structures: VariableStatementStructure[]): statement.VariableStatement[];
    /**
     * Gets the direct variable statement children.
     */
    getVariableStatements(): statement.VariableStatement[];
    /**
     * Gets a variable statement.
     * @param findFunction - Function to use to find the variable statement.
     */
    getVariableStatement(findFunction: (declaration: statement.VariableStatement) => boolean): statement.VariableStatement | undefined;
    /**
     * Gets a variable statement or throws if it doesn't exist.
     * @param findFunction - Function to use to find the variable statement.
     */
    getVariableStatementOrThrow(findFunction: (declaration: statement.VariableStatement) => boolean): statement.VariableStatement;
    /**
     * Gets the variable declaration lists of the direct variable statement children.
     */
    getVariableDeclarationLists(): statement.VariableDeclarationList[];
    /**
     * Gets a variable declaration list.
     * @param findFunction - Function to use to find the variable declaration list.
     */
    getVariableDeclarationList(findFunction: (declaration: statement.VariableDeclarationList) => boolean): statement.VariableDeclarationList | undefined;
    /**
     * Gets a variable declaration list or throws if it doesn't exist.
     * @param findFunction - Function to use to find the variable declaration list.
     */
    getVariableDeclarationListOrThrow(findFunction: (declaration: statement.VariableDeclarationList) => boolean): statement.VariableDeclarationList;
    /**
     * Gets all the variable declarations within all the variable declarations of the direct variable statement children.
     */
    getVariableDeclarations(): statement.VariableDeclaration[];
    /**
     * Gets a variable declaration.
     * @param name - Name of the variable declaration.
     */
    getVariableDeclaration(name: string): statement.VariableDeclaration | undefined;
    /**
     * Gets a variable declaration.
     * @param findFunction - Function to use to find the variable declaration.
     */
    getVariableDeclaration(findFunction: (declaration: statement.VariableDeclaration) => boolean): statement.VariableDeclaration | undefined;
    /**
     * Gets a variable declaration or throws if it doesn't exist.
     * @param name - Name of the variable declaration.
     */
    getVariableDeclarationOrThrow(name: string): statement.VariableDeclaration;
    /**
     * Gets a variable declaration or throws if it doesn't exist.
     * @param findFunction - Function to use to find the variable declaration.
     */
    getVariableDeclarationOrThrow(findFunction: (declaration: statement.VariableDeclaration) => boolean): statement.VariableDeclaration;

    /**
     * @internal
     */
    _insertMainChildren<T extends Node, TStructure = {}>(
        index: number,
        childCodes: string[],
        structures: TStructure[],
        expectedSyntaxKind: ts.SyntaxKind,
        withEachChild?: (child: T, index: number) => void,
        opts?: {
            previousBlanklineWhen?: (nextMember: Node, lastStructure: TStructure) => boolean,
            separatorNewlineWhen?: (previousStructure: TStructure, nextStructure: TStructure) => boolean,
            nextBlanklineWhen?: (nextMember: Node, lastStructure: TStructure) => boolean
        }
    ): T[];
}

export function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T {
    return class extends Base implements StatementedNode {
        /* General */
        getStatements() {
            let statements: ts.NodeArray<ts.Statement>;
            if (TypeGuards.isSourceFile(this))
                statements = this.compilerNode.statements;
            else if (TypeGuards.isNamespaceDeclaration(this)) {
                // need to get the inner-most body for namespaces
                let node = this as Node;
                while (TypeGuards.isBodiedNode(node) && (node.compilerNode as ts.Block).statements == null) {
                    node = node.getBody();
                }
                statements = (node.compilerNode as ts.Block).statements;
            }
            else if (TypeGuards.isBodyableNode(this))
                statements = (this.getBodyOrThrow().compilerNode as any).statements as ts.NodeArray<ts.Statement>;
            else if (TypeGuards.isBodiedNode(this))
                statements = (this.getBody().compilerNode as any).statements as ts.NodeArray<ts.Statement>;
            else
                throw new errors.NotImplementedError(`Could not find the statements for the node: ${this.getText()}`);

            return statements.map(s => this.global.compilerFactory.getNodeFromCompilerNode(s, this.sourceFile));
        }

        /* Classes */

        addClass(structure: ClassDeclarationStructure) {
            return this.addClasses([structure])[0];
        }

        addClasses(structures: ClassDeclarationStructure[]) {
            return this.insertClasses(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertClass(index: number, structure: ClassDeclarationStructure) {
            return this.insertClasses(index, [structure])[0];
        }

        insertClasses(index: number, structures: ClassDeclarationStructure[]): classes.ClassDeclaration[] {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => `${indentationText}class ${structure.name} {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren<classes.ClassDeclaration>(index, texts, structures, ts.SyntaxKind.ClassDeclaration, (child, i) => {
                child.fill(structures[i]);
            });

            return newChildren;
        }

        getClasses(): classes.ClassDeclaration[] {
            // todo: remove type assertion
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ClassDeclaration) as classes.ClassDeclaration[];
        }

        getClass(name: string): classes.ClassDeclaration | undefined;
        getClass(findFunction: (declaration: classes.ClassDeclaration) => boolean): classes.ClassDeclaration | undefined;
        getClass(nameOrFindFunction: string | ((declaration: classes.ClassDeclaration) => boolean)): classes.ClassDeclaration | undefined;
        getClass(nameOrFindFunction: string | ((declaration: classes.ClassDeclaration) => boolean)): classes.ClassDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getClasses(), nameOrFindFunction);
        }

        getClassOrThrow(name: string): classes.ClassDeclaration;
        getClassOrThrow(findFunction: (declaration: classes.ClassDeclaration) => boolean): classes.ClassDeclaration;
        getClassOrThrow(nameOrFindFunction: string | ((declaration: classes.ClassDeclaration) => boolean)): classes.ClassDeclaration {
            return errors.throwIfNullOrUndefined(this.getClass(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("class", nameOrFindFunction));
        }

        /* Enums */

        addEnum(structure: EnumDeclarationStructure) {
            return this.addEnums([structure])[0];
        }

        addEnums(structures: EnumDeclarationStructure[]) {
            return this.insertEnums(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertEnum(index: number, structure: EnumDeclarationStructure) {
            return this.insertEnums(index, [structure])[0];
        }

        insertEnums(index: number, structures: EnumDeclarationStructure[]) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => `${indentationText}${structure.isConst ? "const " : ""}enum ${structure.name} {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren<enums.EnumDeclaration>(index, texts, structures, ts.SyntaxKind.EnumDeclaration, (child, i) => {
                child.fill(structures[i]);
            });

            return newChildren;
        }

        getEnums(): enums.EnumDeclaration[] {
            // todo: remove type assertion
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.EnumDeclaration) as enums.EnumDeclaration[];
        }

        getEnum(name: string): enums.EnumDeclaration | undefined;
        getEnum(findFunction: (declaration: enums.EnumDeclaration) => boolean): enums.EnumDeclaration | undefined;
        getEnum(nameOrFindFunction: string | ((declaration: enums.EnumDeclaration) => boolean)): enums.EnumDeclaration | undefined;
        getEnum(nameOrFindFunction: string | ((declaration: enums.EnumDeclaration) => boolean)): enums.EnumDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getEnums(), nameOrFindFunction);
        }

        getEnumOrThrow(name: string): enums.EnumDeclaration;
        getEnumOrThrow(findFunction: (declaration: enums.EnumDeclaration) => boolean): enums.EnumDeclaration;
        getEnumOrThrow(nameOrFindFunction: string | ((declaration: enums.EnumDeclaration) => boolean)): enums.EnumDeclaration {
            return errors.throwIfNullOrUndefined(this.getEnum(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("enum", nameOrFindFunction));
        }

        /* Functions */

        addFunction(structure: FunctionDeclarationStructure) {
            return this.addFunctions([structure])[0];
        }

        addFunctions(structures: FunctionDeclarationStructure[]) {
            return this.insertFunctions(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertFunction(index: number, structure: FunctionDeclarationStructure) {
            return this.insertFunctions(index, [structure])[0];
        }

        insertFunctions(index: number, structures: FunctionDeclarationStructure[]) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => `${indentationText}function ${structure.name}() {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren<functions.FunctionDeclaration>(index, texts, structures, ts.SyntaxKind.FunctionDeclaration, (child, i) => {
                child.fill(structures[i]);
            });

            return newChildren;
        }

        getFunctions(): functions.FunctionDeclaration[] {
            // todo: remove type assertion
            return (this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.FunctionDeclaration) as functions.FunctionDeclaration[])
                .filter(f => f.isAmbient() || f.isImplementation());
        }

        getFunction(name: string): functions.FunctionDeclaration | undefined;
        getFunction(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration | undefined;
        getFunction(nameOrFindFunction: string | ((declaration: functions.FunctionDeclaration) => boolean)): functions.FunctionDeclaration | undefined;
        getFunction(nameOrFindFunction: string | ((declaration: functions.FunctionDeclaration) => boolean)): functions.FunctionDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getFunctions(), nameOrFindFunction);
        }

        getFunctionOrThrow(name: string): functions.FunctionDeclaration;
        getFunctionOrThrow(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration;
        getFunctionOrThrow(nameOrFindFunction: string | ((declaration: functions.FunctionDeclaration) => boolean)): functions.FunctionDeclaration {
            return errors.throwIfNullOrUndefined(this.getFunction(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("function", nameOrFindFunction));
        }

        /* Interfaces */

        addInterface(structure: InterfaceDeclarationStructure) {
            return this.addInterfaces([structure])[0];
        }

        addInterfaces(structures: InterfaceDeclarationStructure[]) {
            return this.insertInterfaces(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertInterface(index: number, structure: InterfaceDeclarationStructure) {
            return this.insertInterfaces(index, [structure])[0];
        }

        insertInterfaces(index: number, structures: InterfaceDeclarationStructure[]) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => `${indentationText}interface ${structure.name} {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren<interfaces.InterfaceDeclaration>(index, texts, structures, ts.SyntaxKind.InterfaceDeclaration, (child, i) => {
                child.fill(structures[i]);
            });

            return newChildren;
        }

        getInterfaces(): interfaces.InterfaceDeclaration[] {
            // todo: remove type assertion
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.InterfaceDeclaration) as interfaces.InterfaceDeclaration[];
        }

        getInterface(name: string): interfaces.InterfaceDeclaration | undefined;
        getInterface(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration | undefined;
        getInterface(nameOrFindFunction: string | ((declaration: interfaces.InterfaceDeclaration) => boolean)): interfaces.InterfaceDeclaration | undefined;
        getInterface(nameOrFindFunction: string | ((declaration: interfaces.InterfaceDeclaration) => boolean)): interfaces.InterfaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getInterfaces(), nameOrFindFunction);
        }

        getInterfaceOrThrow(name: string): interfaces.InterfaceDeclaration;
        getInterfaceOrThrow(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration;
        getInterfaceOrThrow(nameOrFindFunction: string | ((declaration: interfaces.InterfaceDeclaration) => boolean)): interfaces.InterfaceDeclaration {
            return errors.throwIfNullOrUndefined(this.getInterface(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("interface", nameOrFindFunction));
        }

        /* Namespaces */

        addNamespace(structure: NamespaceDeclarationStructure) {
            return this.addNamespaces([structure])[0];
        }

        addNamespaces(structures: NamespaceDeclarationStructure[]) {
            return this.insertNamespaces(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertNamespace(index: number, structure: NamespaceDeclarationStructure) {
            return this.insertNamespaces(index, [structure])[0];
        }

        insertNamespaces(index: number, structures: NamespaceDeclarationStructure[]) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => {
                return `${indentationText}${structure.hasModuleKeyword ? "module" : "namespace"} ${structure.name} {${newLineChar}${indentationText}}`;
            });
            const newChildren = this._insertMainChildren<namespaces.NamespaceDeclaration>(index, texts, structures, ts.SyntaxKind.ModuleDeclaration, (child, i) => {
                child.fill(structures[i]);
            });

            return newChildren;
        }

        getNamespaces(): namespaces.NamespaceDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.ModuleDeclaration) as namespaces.NamespaceDeclaration[];
        }

        getNamespace(name: string): namespaces.NamespaceDeclaration | undefined;
        getNamespace(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration | undefined;
        getNamespace(nameOrFindFunction: string | ((declaration: namespaces.NamespaceDeclaration) => boolean)): namespaces.NamespaceDeclaration | undefined;
        getNamespace(nameOrFindFunction: string | ((declaration: namespaces.NamespaceDeclaration) => boolean)): namespaces.NamespaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getNamespaces(), nameOrFindFunction);
        }

        getNamespaceOrThrow(name: string): namespaces.NamespaceDeclaration;
        getNamespaceOrThrow(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration;
        getNamespaceOrThrow(nameOrFindFunction: string | ((declaration: namespaces.NamespaceDeclaration) => boolean)): namespaces.NamespaceDeclaration {
            return errors.throwIfNullOrUndefined(this.getNamespace(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("namespace", nameOrFindFunction));
        }

        /* Type aliases */

        addTypeAlias(structure: TypeAliasDeclarationStructure) {
            return this.addTypeAliases([structure])[0];
        }

        addTypeAliases(structures: TypeAliasDeclarationStructure[]) {
            return this.insertTypeAliases(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertTypeAlias(index: number, structure: TypeAliasDeclarationStructure) {
            return this.insertTypeAliases(index, [structure])[0];
        }

        insertTypeAliases(index: number, structures: TypeAliasDeclarationStructure[]) {
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => {
                return `${indentationText}type ${structure.name} = ${structure.type};`;
            });
            const newChildren = this._insertMainChildren<types.TypeAliasDeclaration, TypeAliasDeclarationStructure>(
                index, texts, structures, ts.SyntaxKind.TypeAliasDeclaration, (child, i) => {
                    child.fill(structures[i]);
                }, {
                    previousBlanklineWhen: previousMember => !TypeGuards.isTypeAliasDeclaration(previousMember),
                    separatorNewlineWhen: () => false,
                    nextBlanklineWhen: nextMember => !TypeGuards.isTypeAliasDeclaration(nextMember)
                });

            return newChildren;
        }

        getTypeAliases(): types.TypeAliasDeclaration[] {
            // todo: remove type assertion
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.TypeAliasDeclaration) as types.TypeAliasDeclaration[];
        }

        getTypeAlias(name: string): types.TypeAliasDeclaration | undefined;
        getTypeAlias(findFunction: (declaration: types.TypeAliasDeclaration) => boolean): types.TypeAliasDeclaration | undefined;
        getTypeAlias(nameOrFindFunction: string | ((declaration: types.TypeAliasDeclaration) => boolean)): types.TypeAliasDeclaration | undefined;
        getTypeAlias(nameOrFindFunction: string | ((declaration: types.TypeAliasDeclaration) => boolean)): types.TypeAliasDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getTypeAliases(), nameOrFindFunction);
        }

        getTypeAliasOrThrow(name: string): types.TypeAliasDeclaration;
        getTypeAliasOrThrow(findFunction: (declaration: types.TypeAliasDeclaration) => boolean): types.TypeAliasDeclaration;
        getTypeAliasOrThrow(nameOrFindFunction: string | ((declaration: types.TypeAliasDeclaration) => boolean)): types.TypeAliasDeclaration {
            return errors.throwIfNullOrUndefined(this.getTypeAlias(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("type alias", nameOrFindFunction));
        }

        /* Variable statements */

        getVariableStatements(): statement.VariableStatement[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind(ts.SyntaxKind.VariableStatement) as statement.VariableStatement[];
        }

        getVariableStatement(findFunction: (declaration: statement.VariableStatement) => boolean): statement.VariableStatement | undefined {
            return this.getVariableStatements().find(findFunction);
        }

        getVariableStatementOrThrow(findFunction: (declaration: statement.VariableStatement) => boolean): statement.VariableStatement {
            return errors.throwIfNullOrUndefined(this.getVariableStatement(findFunction), "Expected to find a variable statement that matched the provided condition.");
        }

        addVariableStatement(structure: VariableStatementStructure) {
            return this.addVariableStatements([structure])[0];
        }

        addVariableStatements(structures: VariableStatementStructure[]) {
            return this.insertVariableStatements(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertVariableStatement(index: number, structure: VariableStatementStructure) {
            return this.insertVariableStatements(index, [structure])[0];
        }

        insertVariableStatements(index: number, structures: VariableStatementStructure[]) {
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => {
                let text = `${indentationText}${structure.declarationType || VariableDeclarationType.Let} `;
                const declarationTexts: string[] = [];
                for (const declarationStructure of structure.declarations) {
                    let declarationText = declarationStructure.name;
                    if (declarationStructure.type != null)
                        declarationText += ": " + declarationStructure.type;
                    if (declarationStructure.initializer != null)
                        declarationText += " = " + declarationStructure.initializer;
                    declarationTexts.push(declarationText);
                }
                text += declarationTexts.join(", ");
                text += ";";
                return text;
            });
            const newChildren = this._insertMainChildren<statement.VariableStatement>(index, texts, structures, ts.SyntaxKind.VariableStatement, (child, i) => {
                const structure = {...structures[i]};
                delete structure.declarations;
                delete structure.declarationType;
                child.fill(structure);
            }, {
                previousBlanklineWhen: previousMember => !TypeGuards.isVariableStatement(previousMember),
                separatorNewlineWhen: () => false,
                nextBlanklineWhen: nextMember => !TypeGuards.isVariableStatement(nextMember)
            });

            return newChildren;
        }

        /* Variable declaration lists */

        getVariableDeclarationLists(): statement.VariableDeclarationList[] {
            return this.getVariableStatements().map(s => s.getDeclarationList());
        }

        getVariableDeclarationList(findFunction: (declaration: statement.VariableDeclarationList) => boolean): statement.VariableDeclarationList | undefined {
            return this.getVariableDeclarationLists().find(findFunction);
        }

        getVariableDeclarationListOrThrow(findFunction: (declaration: statement.VariableDeclarationList) => boolean): statement.VariableDeclarationList {
            return errors.throwIfNullOrUndefined(this.getVariableDeclarationList(findFunction), "Could not find a variable declaration that matched the provided condition.");
        }

        /* Variable declarations */

        getVariableDeclarations(): statement.VariableDeclaration[] {
            const variables: statement.VariableDeclaration[] = [];

            for (const list of this.getVariableDeclarationLists()) {
                variables.push(...list.getDeclarations());
            }

            return variables;
        }

        getVariableDeclaration(name: string): statement.VariableDeclaration | undefined;
        getVariableDeclaration(findFunction: (declaration: statement.VariableDeclaration) => boolean): statement.VariableDeclaration | undefined;
        getVariableDeclaration(nameOrFindFunction: string | ((declaration: statement.VariableDeclaration) => boolean)): statement.VariableDeclaration | undefined;
        getVariableDeclaration(nameOrFindFunction: string | ((declaration: statement.VariableDeclaration) => boolean)): statement.VariableDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getVariableDeclarations(), nameOrFindFunction);
        }

        getVariableDeclarationOrThrow(name: string): statement.VariableDeclaration;
        getVariableDeclarationOrThrow(findFunction: (declaration: statement.VariableDeclaration) => boolean): statement.VariableDeclaration;
        getVariableDeclarationOrThrow(nameOrFindFunction: string | ((declaration: statement.VariableDeclaration) => boolean)): statement.VariableDeclaration {
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

        // todo: make this passed an object
        _insertMainChildren<U extends Node, TStructure = {}>(
            index: number,
            childCodes: string[],
            structures: TStructure[],
            expectedSyntaxKind: ts.SyntaxKind,
            withEachChild?: ((child: U, index: number) => void),
            opts: {
                previousBlanklineWhen?: (nextMember: Node, lastStructure: TStructure) => boolean,
                separatorNewlineWhen?: (previousStructure: TStructure, nextStructure: TStructure) => boolean,
                nextBlanklineWhen?: (nextMember: Node, lastStructure: TStructure) => boolean
            } = {}
        ) {
            const syntaxList = this.getChildSyntaxListOrThrow();
            const mainChildren = syntaxList.getChildren();
            const newLineChar = this.global.manipulationSettings.getNewLineKind();
            index = verifyAndGetIndex(index, mainChildren.length);

            // insert into a temp file
            const finalChildCodes: string[] = [];
            for (let i = 0; i < childCodes.length; i++) {
                using(this.global.compilerFactory.createTempSourceFileFromText(childCodes[i]), tempSourceFile => {
                    if (withEachChild != null) {
                        const tempSyntaxList = tempSourceFile.getChildSyntaxListOrThrow();
                        withEachChild(tempSyntaxList.getChildren()[0] as U, i);
                    }
                    finalChildCodes.push(tempSourceFile.getFullText());
                });
            }

            // insert
            const doBlankLine = () => true;
            insertIntoBracesOrSourceFile<TStructure>({
                parent: this as any as Node,
                children: mainChildren,
                index,
                childCodes: finalChildCodes,
                structures,
                separator: newLineChar,
                previousBlanklineWhen: opts.previousBlanklineWhen || doBlankLine,
                separatorNewlineWhen: opts.separatorNewlineWhen || doBlankLine,
                nextBlanklineWhen: opts.nextBlanklineWhen || doBlankLine
            });

            // get children
            return getRangeFromArray<U>(syntaxList.getChildren(), index, childCodes.length, expectedSyntaxKind);
        }
    };
}
