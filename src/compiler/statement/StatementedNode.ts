import * as ts from "typescript";
import * as errors from "./../../errors";
import * as structures from "./../../structures";
import {verifyAndGetIndex, insertIntoBracesOrSourceFile, getRangeFromArray} from "./../../manipulation";
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
    addClass(structure: structures.ClassStructure): classes.ClassDeclaration;
    /**
     * Adds class declarations as a child.
     * @param structures - Structures of the class declarations to add.
     */
    addClasses(structures: structures.ClassStructure[]): classes.ClassDeclaration[];
    /**
     * Inserts an class declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the class declaration to insert.
     */
    insertClass(index: number, structure: structures.ClassStructure): classes.ClassDeclaration;
    /**
     * Inserts class declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the class declarations to insert.
     */
    insertClasses(index: number, structures: structures.ClassStructure[]): classes.ClassDeclaration[];
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
    addEnum(structure: structures.EnumStructure): enums.EnumDeclaration;
    /**
     * Adds enum declarations as a child.
     * @param structures - Structures of the enum declarations to add.
     */
    addEnums(structures: structures.EnumStructure[]): enums.EnumDeclaration[];
    /**
     * Inserts an enum declaration as a child.
     * @param index - Index to insert at.
     * @param structure - Structure of the enum declaration to insert.
     */
    insertEnum(index: number, structure: structures.EnumStructure): enums.EnumDeclaration;
    /**
     * Inserts enum declarations as a child.
     * @param index - Index to insert at.
     * @param structures - Structures of the enum declarations to insert.
     */
    insertEnums(index: number, structures: structures.EnumStructure[]): enums.EnumDeclaration[];
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
}

export function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T {
    return class extends Base implements StatementedNode {
        /* Classes */

        addClass(structure: structures.ClassStructure) {
            return this.addClasses([structure])[0];
        }

        addClasses(structures: structures.ClassStructure[]) {
            return this.insertClasses(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertClass(index: number, structure: structures.ClassStructure) {
            return this.insertClasses(index, [structure])[0];
        }

        insertClasses(index: number, structures: structures.ClassStructure[]): classes.ClassDeclaration[] {
            const newLineChar = this.factory.getLanguageService().getNewLine();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => `${indentationText}class ${structure.name} {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren<classes.ClassDeclaration>(index, texts, ts.SyntaxKind.ClassDeclaration, (child, i) => {
                // todo: should insert based on fill function
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

        addEnum(structure: structures.EnumStructure) {
            return this.addEnums([structure])[0];
        }

        addEnums(structures: structures.EnumStructure[]) {
            return this.insertEnums(this.getChildSyntaxListOrThrow().getChildCount(), structures);
        }

        insertEnum(index: number, structure: structures.EnumStructure) {
            return this.insertEnums(index, [structure])[0];
        }

        insertEnums(index: number, structures: structures.EnumStructure[]) {
            const newLineChar = this.factory.getLanguageService().getNewLine();
            const indentationText = this.getChildIndentationText();
            const texts = structures.map(structure => `${indentationText}${structure.isConst ? "const " : ""}enum ${structure.name} {${newLineChar}${indentationText}}`);
            const newChildren = this._insertMainChildren<enums.EnumDeclaration>(index, texts, ts.SyntaxKind.EnumDeclaration, (child, i) => {
                // todo: should insert based on fill function
                for (const member of structures[i].members || []) {
                    child.addMember(member);
                }
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

        getFunctions(): functions.FunctionDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind<functions.FunctionDeclaration>(ts.SyntaxKind.FunctionDeclaration);
        }

        getFunction(name: string): functions.FunctionDeclaration | undefined;
        getFunction(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration | undefined;
        getFunction(nameOrFindFunction: string | ((declaration: functions.FunctionDeclaration) => boolean)): functions.FunctionDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getFunctions(), nameOrFindFunction);
        }

        getInterfaces(): interfaces.InterfaceDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind<interfaces.InterfaceDeclaration>(ts.SyntaxKind.InterfaceDeclaration);
        }

        getInterface(name: string): interfaces.InterfaceDeclaration | undefined;
        getInterface(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration | undefined;
        getInterface(nameOrFindFunction: string | ((declaration: interfaces.InterfaceDeclaration) => boolean)): interfaces.InterfaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getInterfaces(), nameOrFindFunction);
        }

        getNamespaces(): namespaces.NamespaceDeclaration[] {
            return this.getChildSyntaxListOrThrow().getChildrenOfKind<namespaces.NamespaceDeclaration>(ts.SyntaxKind.ModuleDeclaration);
        }

        getNamespace(name: string): namespaces.NamespaceDeclaration | undefined;
        getNamespace(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration | undefined;
        getNamespace(nameOrFindFunction: string | ((declaration: namespaces.NamespaceDeclaration) => boolean)): namespaces.NamespaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getNamespaces(), nameOrFindFunction);
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

        private _insertMainChildren<T extends Node>(
            index: number,
            childCodes: string[],
            expectedSyntaxKind: ts.SyntaxKind,
            withEachChild: (child: T, index: number) => void
        ) {
            const syntaxList = this.getChildSyntaxListOrThrow();
            const mainChildren = syntaxList.getChildren();
            const newLineChar = this.factory.getLanguageService().getNewLine();
            index = verifyAndGetIndex(index, mainChildren.length);

            // insert into a temp file
            const finalChildCodes: string[] = [];
            for (let i = 0; i < childCodes.length; i++) {
                using(this.factory.createTempSourceFileFromText(childCodes[i]), tempSourceFile => {
                    const tempSyntaxList = tempSourceFile.getChildSyntaxListOrThrow();
                    withEachChild(tempSyntaxList.getChildren()[0] as T, i);
                    finalChildCodes.push(tempSourceFile.getFullText());
                });
            }

            // insert
            insertIntoBracesOrSourceFile({
                languageService: this.factory.getLanguageService(),
                sourceFile: this.getSourceFile(),
                parent: this as any as Node,
                children: mainChildren,
                index,
                childCodes: finalChildCodes,
                separator: newLineChar + newLineChar
            });
            this.appendNewLineSeparatorIfNecessary();

            // get children
            return getRangeFromArray<T>(syntaxList.getChildren(), index, childCodes.length, expectedSyntaxKind);
        }
    };
}
