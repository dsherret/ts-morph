import * as ts from "typescript";
import * as errors from "./../../errors";
import * as structures from "./../../structures";
import {getNamedNodeByNameOrFindFunction} from "./../../utils";
import {Node} from "./../common";
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
     * Gets the body node or returns the source file if a source file.
     */
    getBody(): Node;
    /**
     * Adds an enum declaration as a child.
     * @param structure - Structure of the enum declaration to add.
     */
    addEnum(structure: structures.EnumStructure): enums.EnumDeclaration;
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
        getBody(): Node {
            /* istanbul ignore else */
            if (this.isSourceFile())
                return this;
            else if (this.isNamespaceDeclaration())
                return this.factory.getNodeFromCompilerNode(this.node.body);
            else if (this.isFunctionDeclaration()) {
                /* istanbul ignore if */
                if (this.node.body == null)
                    throw new errors.NotImplementedError("Function declaration has no body.");

                return this.factory.getNodeFromCompilerNode(this.node.body);
            }
            else
                throw this.getNotImplementedError();
        }

        /** @internal */
        getInsertPosition() {
            if (this.isSourceFile())
                return this.getEnd();
            else
                return this.getBody().getEnd() - 1;
        }

        addEnum(structure: structures.EnumStructure): enums.EnumDeclaration {
            const sourceFile = this.getRequiredSourceFile();
            const newLineChar = this.factory.getLanguageService().getNewLine();
            const indentationText = this.getChildIndentationText(sourceFile);
            this.appendNewLineSeparatorIfNecessary(sourceFile);
            const text = `${indentationText}enum ${structure.name} {${newLineChar}${indentationText}}${newLineChar}`;
            sourceFile.insertText(this.getInsertPosition(), text);

            const enumDeclarations = this.getEnums();
            const declaration = enumDeclarations[enumDeclarations.length - 1];

            declaration.setIsConstEnum(structure.isConst || false);
            for (const member of structure.members || []) {
                declaration.addMember(member);
            }

            return declaration;
        }

        getClasses(): classes.ClassDeclaration[] {
            return this.getMainChildrenOfKind<classes.ClassDeclaration>(ts.SyntaxKind.ClassDeclaration);
        }

        getClass(name: string): classes.ClassDeclaration | undefined;
        getClass(findFunction: (declaration: classes.ClassDeclaration) => boolean): classes.ClassDeclaration | undefined;
        getClass(nameOrFindFunction: string | ((declaration: classes.ClassDeclaration) => boolean)): classes.ClassDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getClasses(), nameOrFindFunction);
        }

        getEnums(): enums.EnumDeclaration[] {
            return this.getMainChildrenOfKind<enums.EnumDeclaration>(ts.SyntaxKind.EnumDeclaration);
        }

        getEnum(name: string): enums.EnumDeclaration | undefined;
        getEnum(findFunction: (declaration: enums.EnumDeclaration) => boolean): enums.EnumDeclaration | undefined;
        getEnum(nameOrFindFunction: string | ((declaration: enums.EnumDeclaration) => boolean)): enums.EnumDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getEnums(), nameOrFindFunction);
        }

        getFunctions(): functions.FunctionDeclaration[] {
            return this.getMainChildrenOfKind<functions.FunctionDeclaration>(ts.SyntaxKind.FunctionDeclaration);
        }

        getFunction(name: string): functions.FunctionDeclaration | undefined;
        getFunction(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration | undefined;
        getFunction(nameOrFindFunction: string | ((declaration: functions.FunctionDeclaration) => boolean)): functions.FunctionDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getFunctions(), nameOrFindFunction);
        }

        getInterfaces(): interfaces.InterfaceDeclaration[] {
            return this.getMainChildrenOfKind<interfaces.InterfaceDeclaration>(ts.SyntaxKind.InterfaceDeclaration);
        }

        getInterface(name: string): interfaces.InterfaceDeclaration | undefined;
        getInterface(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration | undefined;
        getInterface(nameOrFindFunction: string | ((declaration: interfaces.InterfaceDeclaration) => boolean)): interfaces.InterfaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getInterfaces(), nameOrFindFunction);
        }

        getNamespaces(): namespaces.NamespaceDeclaration[] {
            return this.getMainChildrenOfKind<namespaces.NamespaceDeclaration>(ts.SyntaxKind.ModuleDeclaration);
        }

        getNamespace(name: string): namespaces.NamespaceDeclaration | undefined;
        getNamespace(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration | undefined;
        getNamespace(nameOrFindFunction: string | ((declaration: namespaces.NamespaceDeclaration) => boolean)): namespaces.NamespaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getNamespaces(), nameOrFindFunction);
        }

        getTypeAliases(): types.TypeAliasDeclaration[] {
            return this.getMainChildrenOfKind<types.TypeAliasDeclaration>(ts.SyntaxKind.TypeAliasDeclaration);
        }

        getTypeAlias(name: string): types.TypeAliasDeclaration | undefined;
        getTypeAlias(findFunction: (declaration: types.TypeAliasDeclaration) => boolean): types.TypeAliasDeclaration | undefined;
        getTypeAlias(nameOrFindFunction: string | ((declaration: types.TypeAliasDeclaration) => boolean)): types.TypeAliasDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getTypeAliases(), nameOrFindFunction);
        }

        getVariableStatements(): variable.VariableStatement[] {
            return this.getMainChildrenOfKind<variable.VariableStatement>(ts.SyntaxKind.VariableStatement);
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
    };
}
