import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {ClassDeclarationStructure, InterfaceDeclarationStructure, TypeAliasDeclarationStructure, FunctionDeclarationStructure,
    EnumDeclarationStructure, NamespaceDeclarationStructure} from "./../../structures";
import {verifyAndGetIndex, insertIntoBracesOrSourceFile, getRangeFromArray} from "./../../manipulation";
import * as fillClassFuncs from "./../../manipulation/fillClassFunctions";
import {getNamedNodeByNameOrFindFunction, using} from "./../../utils";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import * as classes from "./../class";
import * as enums from "./../enum";
import * as functions from "./../function";
import * as interfaces from "./../interface";
import * as namespaces from "./../namespace";
import * as types from "./../type";
import * as variable from "./../variable";

export type StatementedNodeExtensionType = Node<ts.SourceFile | ts.FunctionDeclaration | ts.ModuleDeclaration | ts.FunctionLikeDeclaration>;

export interface StatementedNode {
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
     * Gets the direct variable statement children.
     */
    getVariableStatements(): variable.VariableStatement[];
    /**
     * Gets a variable statement.
     * @param findFunction - Function to use to find the variable statement.
     */
    getVariableStatement(findFunction: (declaration: variable.VariableStatement) => boolean): variable.VariableStatement | undefined;
    /**
     * Gets the variable declaration lists of the direct variable statement children.
     */
    getVariableDeclarationLists(): variable.VariableDeclarationList[];
    /**
     * Gets a variable declaration list.
     * @param findFunction - Function to use to find the variable declaration list.
     */
    getVariableDeclarationList(findFunction: (declaration: variable.VariableDeclarationList) => boolean): variable.VariableDeclarationList | undefined;
    /**
     * Gets all the variable declarations within all the variable declarations of the direct variable statement children.
     */
    getVariableDeclarations(): variable.VariableDeclaration[];
    /**
     * Gets a variable declaration.
     * @param name - Name of the variable declaration.
     */
    getVariableDeclaration(name: string): variable.VariableDeclaration | undefined;
    /**
     * Gets a variable declaration.
     * @param findFunction - Function to use to find the variable declaration.
     */
    getVariableDeclaration(findFunction: (declaration: variable.VariableDeclaration) => boolean): variable.VariableDeclaration | undefined;

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
                fillClassFuncs.fillClassDeclarationFromStructure(child, structures[i]);
            });

            return newChildren;
        }

        getClasses(): classes.ClassDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind<classes.ClassDeclaration>(ts.SyntaxKind.ClassDeclaration);
        }

        getClass(name: string): classes.ClassDeclaration | undefined;
        getClass(findFunction: (declaration: classes.ClassDeclaration) => boolean): classes.ClassDeclaration | undefined;
        getClass(nameOrFindFunction: string | ((declaration: classes.ClassDeclaration) => boolean)): classes.ClassDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getClasses(), nameOrFindFunction);
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
                fillClassFuncs.fillEnumDeclarationFromStructure(child, structures[i]);
            });

            return newChildren;
        }

        getEnums(): enums.EnumDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind<enums.EnumDeclaration>(ts.SyntaxKind.EnumDeclaration);
        }

        getEnum(name: string): enums.EnumDeclaration | undefined;
        getEnum(findFunction: (declaration: enums.EnumDeclaration) => boolean): enums.EnumDeclaration | undefined;
        getEnum(nameOrFindFunction: string | ((declaration: enums.EnumDeclaration) => boolean)): enums.EnumDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getEnums(), nameOrFindFunction);
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
                fillClassFuncs.fillFunctionDeclarationFromStructure(child, structures[i]);
            });

            return newChildren;
        }

        getFunctions(): functions.FunctionDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind<functions.FunctionDeclaration>(ts.SyntaxKind.FunctionDeclaration)
                .filter(f => f.isAmbient() || f.isImplementation());
        }

        getFunction(name: string): functions.FunctionDeclaration | undefined;
        getFunction(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration | undefined;
        getFunction(nameOrFindFunction: string | ((declaration: functions.FunctionDeclaration) => boolean)): functions.FunctionDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getFunctions(), nameOrFindFunction);
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
                fillClassFuncs.fillInterfaceDeclarationFromStructure(child, structures[i]);
            });

            return newChildren;
        }

        getInterfaces(): interfaces.InterfaceDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind<interfaces.InterfaceDeclaration>(ts.SyntaxKind.InterfaceDeclaration);
        }

        getInterface(name: string): interfaces.InterfaceDeclaration | undefined;
        getInterface(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration | undefined;
        getInterface(nameOrFindFunction: string | ((declaration: interfaces.InterfaceDeclaration) => boolean)): interfaces.InterfaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getInterfaces(), nameOrFindFunction);
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
                fillClassFuncs.fillNamespaceDeclarationFromStructure(child, structures[i]);
            });

            return newChildren;
        }

        getNamespaces(): namespaces.NamespaceDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind<namespaces.NamespaceDeclaration>(ts.SyntaxKind.ModuleDeclaration);
        }

        getNamespace(name: string): namespaces.NamespaceDeclaration | undefined;
        getNamespace(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration | undefined;
        getNamespace(nameOrFindFunction: string | ((declaration: namespaces.NamespaceDeclaration) => boolean)): namespaces.NamespaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getNamespaces(), nameOrFindFunction);
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
                    fillClassFuncs.fillTypeAliasDeclarationFromStructure(child, structures[i]);
                }, {
                    previousBlanklineWhen: previousMember => !previousMember.isTypeAliasDeclaration(),
                    separatorNewlineWhen: () => false,
                    nextBlanklineWhen: nextMember => !nextMember.isTypeAliasDeclaration()
                });

            return newChildren;
        }

        getTypeAliases(): types.TypeAliasDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind<types.TypeAliasDeclaration>(ts.SyntaxKind.TypeAliasDeclaration);
        }

        getTypeAlias(name: string): types.TypeAliasDeclaration | undefined;
        getTypeAlias(findFunction: (declaration: types.TypeAliasDeclaration) => boolean): types.TypeAliasDeclaration | undefined;
        getTypeAlias(nameOrFindFunction: string | ((declaration: types.TypeAliasDeclaration) => boolean)): types.TypeAliasDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getTypeAliases(), nameOrFindFunction);
        }

        getVariableStatements(): variable.VariableStatement[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind<variable.VariableStatement>(ts.SyntaxKind.VariableStatement);
        }

        getVariableStatement(findFunction: (declaration: variable.VariableStatement) => boolean): variable.VariableStatement | undefined {
            return this.getVariableStatements().find(findFunction);
        }

        getVariableDeclarationLists(): variable.VariableDeclarationList[] {
            return this.getVariableStatements().map(s => s.getDeclarationList());
        }

        getVariableDeclarationList(findFunction: (declaration: variable.VariableDeclarationList) => boolean): variable.VariableDeclarationList | undefined {
            return this.getVariableDeclarationLists().find(findFunction);
        }

        getVariableDeclarations(): variable.VariableDeclaration[] {
            const variables: variable.VariableDeclaration[] = [];

            for (const list of this.getVariableDeclarationLists()) {
                variables.push(...list.getDeclarations());
            }

            return variables;
        }

        getVariableDeclaration(name: string): variable.VariableDeclaration | undefined;
        getVariableDeclaration(findFunction: (declaration: variable.VariableDeclaration) => boolean): variable.VariableDeclaration | undefined;
        getVariableDeclaration(nameOrFindFunction: string | ((declaration: variable.VariableDeclaration) => boolean)): variable.VariableDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getVariableDeclarations(), nameOrFindFunction);
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
            this.appendNewLineSeparatorIfNecessary();

            // get children
            return getRangeFromArray<U>(syntaxList.getChildren(), index, childCodes.length, expectedSyntaxKind);
        }
    };
}
