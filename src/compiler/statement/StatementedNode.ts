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
    getBody(): Node<ts.Node>;
    addEnum(structure: structures.EnumStructure): enums.EnumDeclaration;
    getClasses(): classes.ClassDeclaration[];
    getClass(name: string): classes.ClassDeclaration | undefined;
    getClass(findFunction: (declaration: classes.ClassDeclaration) => boolean): classes.ClassDeclaration | undefined;
    getEnums(): enums.EnumDeclaration[];
    getEnum(name: string): enums.EnumDeclaration | undefined;
    getEnum(findFunction: (declaration: enums.EnumDeclaration) => boolean): enums.EnumDeclaration | undefined;
    getFunctions(): functions.FunctionDeclaration[];
    getFunction(name: string): functions.FunctionDeclaration | undefined;
    getFunction(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration | undefined;
    getInterfaces(): interfaces.InterfaceDeclaration[];
    getInterface(name: string): interfaces.InterfaceDeclaration | undefined;
    getInterface(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration | undefined;
    getNamespaces(): namespaces.NamespaceDeclaration[];
    getNamespace(name: string): namespaces.NamespaceDeclaration | undefined;
    getNamespace(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration | undefined;
    getTypeAliases(): types.TypeAliasDeclaration[];
    getTypeAlias(name: string): types.TypeAliasDeclaration | undefined;
    getTypeAlias(findFunction: (declaration: types.TypeAliasDeclaration) => boolean): types.TypeAliasDeclaration | undefined;
    getVariableStatements(): variable.VariableStatement[];
    getVariableStatement(findFunction: (declaration: variable.VariableStatement) => boolean): variable.VariableStatement | undefined;
    getVariableDeclarationLists(): variable.VariableDeclarationList[];
    getVariableDeclarationList(findFunction: (declaration: variable.VariableDeclarationList) => boolean): variable.VariableDeclarationList | undefined;
    getVariableDeclarations(): variable.VariableDeclaration[];
    getVariableDeclaration(name: string): variable.VariableDeclaration | undefined;
    getVariableDeclaration(findFunction: (declaration: variable.VariableDeclaration) => boolean): variable.VariableDeclaration | undefined;
}

export function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T {
    return class extends Base implements StatementedNode {
        /**
         * Gets the body node or returns the source file if a source file.
         */
        getBody(): Node<ts.Node> {
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

        /**
         * @internal
         */
        getInsertPosition() {
            if (this.isSourceFile())
                return this.getEnd();
            else
                return this.getBody().getEnd() - 1;
        }

        /**
         * Adds an enum declaration as a child.
         * @param structure - Structure of the enum declaration to add.
         */
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
            for (let member of structure.members || []) {
                declaration.addMember(member);
            }

            return declaration;
        }

        /**
         * Gets the direct class declaration children.
         */
        getClasses(): classes.ClassDeclaration[] {
            return this.getMainChildrenOfKind<classes.ClassDeclaration>(ts.SyntaxKind.ClassDeclaration);
        }

        /**
         * Gets a class.
         * @param name - Name of the class.
         * @param findFunction - Function to use to find the class.
         */
        getClass(name: string): classes.ClassDeclaration | undefined;
        getClass(findFunction: (declaration: classes.ClassDeclaration) => boolean): classes.ClassDeclaration | undefined;
        getClass(nameOrFindFunction: string | ((declaration: classes.ClassDeclaration) => boolean)): classes.ClassDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getClasses(), nameOrFindFunction);
        }

        /**
         * Gets the direct enum declaration children.
         */
        getEnums(): enums.EnumDeclaration[] {
            return this.getMainChildrenOfKind<enums.EnumDeclaration>(ts.SyntaxKind.EnumDeclaration);
        }

        /**
         * Gets an enum.
         * @param name - Name of the enum.
         * @param findFunction - Function to use to find the enum.
         */
        getEnum(name: string): enums.EnumDeclaration | undefined;
        getEnum(findFunction: (declaration: enums.EnumDeclaration) => boolean): enums.EnumDeclaration | undefined;
        getEnum(nameOrFindFunction: string | ((declaration: enums.EnumDeclaration) => boolean)): enums.EnumDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getEnums(), nameOrFindFunction);
        }

        /**
         * Gets the direct function declaration children.
         */
        getFunctions(): functions.FunctionDeclaration[] {
            return this.getMainChildrenOfKind<functions.FunctionDeclaration>(ts.SyntaxKind.FunctionDeclaration);
        }

        /**
         * Gets a function.
         * @param name - Name of the function.
         * @param findFunction - Function to use to find the function.
         */
        getFunction(name: string): functions.FunctionDeclaration | undefined;
        getFunction(findFunction: (declaration: functions.FunctionDeclaration) => boolean): functions.FunctionDeclaration | undefined;
        getFunction(nameOrFindFunction: string | ((declaration: functions.FunctionDeclaration) => boolean)): functions.FunctionDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getFunctions(), nameOrFindFunction);
        }

        /**
         * Gets the direct interface declaration children.
         */
        getInterfaces(): interfaces.InterfaceDeclaration[] {
            return this.getMainChildrenOfKind<interfaces.InterfaceDeclaration>(ts.SyntaxKind.InterfaceDeclaration);
        }

        /**
         * Gets an interface.
         * @param name - Name of the interface.
         * @param findFunction - Function to use to find the interface.
         */
        getInterface(name: string): interfaces.InterfaceDeclaration | undefined;
        getInterface(findFunction: (declaration: interfaces.InterfaceDeclaration) => boolean): interfaces.InterfaceDeclaration | undefined;
        getInterface(nameOrFindFunction: string | ((declaration: interfaces.InterfaceDeclaration) => boolean)): interfaces.InterfaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getInterfaces(), nameOrFindFunction);
        }

        /**
         * Gets the direct namespace declaration children.
         */
        getNamespaces(): namespaces.NamespaceDeclaration[] {
            return this.getMainChildrenOfKind<namespaces.NamespaceDeclaration>(ts.SyntaxKind.ModuleDeclaration);
        }

        /**
         * Gets a namespace.
         * @param name - Name of the namespace.
         * @param findFunction - Function to use to find the namespace.
         */
        getNamespace(name: string): namespaces.NamespaceDeclaration | undefined;
        getNamespace(findFunction: (declaration: namespaces.NamespaceDeclaration) => boolean): namespaces.NamespaceDeclaration | undefined;
        getNamespace(nameOrFindFunction: string | ((declaration: namespaces.NamespaceDeclaration) => boolean)): namespaces.NamespaceDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getNamespaces(), nameOrFindFunction);
        }

        /**
         * Gets the direct type alias declaration children.
         */
        getTypeAliases(): types.TypeAliasDeclaration[] {
            return this.getMainChildrenOfKind<types.TypeAliasDeclaration>(ts.SyntaxKind.TypeAliasDeclaration);
        }

        /**
         * Gets a type alias.
         * @param name - Name of the type alias.
         * @param findFunction - Function to use to find the type alias.
         */
        getTypeAlias(name: string): types.TypeAliasDeclaration | undefined;
        getTypeAlias(findFunction: (declaration: types.TypeAliasDeclaration) => boolean): types.TypeAliasDeclaration | undefined;
        getTypeAlias(nameOrFindFunction: string | ((declaration: types.TypeAliasDeclaration) => boolean)): types.TypeAliasDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getTypeAliases(), nameOrFindFunction);
        }

        /**
         * Gets the direct variable statement children.
         */
        getVariableStatements(): variable.VariableStatement[] {
            return this.getMainChildrenOfKind<variable.VariableStatement>(ts.SyntaxKind.VariableStatement);
        }

        /**
         * Gets a variable statement.
         * @param findFunction - Function to use to find the variable statement.
         */
        getVariableStatement(findFunction: (declaration: variable.VariableStatement) => boolean): variable.VariableStatement | undefined {
            return this.getVariableStatements().find(findFunction);
        }

        /**
         * Gets the variable declaration lists of the direct variable statement children.
         */
        getVariableDeclarationLists(): variable.VariableDeclarationList[] {
            return this.getVariableStatements().map(s => s.getDeclarationList());
        }

        /**
         * Gets a variable declaration list.
         * @param findFunction - Function to use to find the variable declaration list.
         */
        getVariableDeclarationList(findFunction: (declaration: variable.VariableDeclarationList) => boolean): variable.VariableDeclarationList | undefined {
            return this.getVariableDeclarationLists().find(findFunction);
        }

        /**
         * Gets all the variable declarations within all the variable declarations of the direct variable statement children.
         */
        getVariableDeclarations(): variable.VariableDeclaration[] {
            const variables: variable.VariableDeclaration[] = [];

            for (let list of this.getVariableDeclarationLists()) {
                variables.push(...list.getDeclarations());
            }

            return variables;
        }

        /**
         * Gets a variable declaration.
         * @param name - Name of the variable declaration.
         * @param findFunction - Function to use to find the variable declaration.
         */
        getVariableDeclaration(name: string): variable.VariableDeclaration | undefined;
        getVariableDeclaration(findFunction: (declaration: variable.VariableDeclaration) => boolean): variable.VariableDeclaration | undefined;
        getVariableDeclaration(nameOrFindFunction: string | ((declaration: variable.VariableDeclaration) => boolean)): variable.VariableDeclaration | undefined {
            return getNamedNodeByNameOrFindFunction(this.getVariableDeclarations(), nameOrFindFunction);
        }
    };
}
