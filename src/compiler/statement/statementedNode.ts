import * as ts from "typescript";
import * as structures from "./../../structures";
import {Node} from "./../common";
import * as classes from "./../class";
import * as enums from "./../enum";
import * as namespaces from "./../namespace";
import * as functions from "./../function";
import * as variable from "./../variable";
import * as interfaces from "./../interface";

export type StatementedNodeExtensionType = Node<ts.SourceFile>;

export interface StatementedNode extends StatementedNodeExtensionType {
    addEnumDeclaration(structure: structures.EnumStructure): enums.EnumDeclaration;
    getClassDeclarations(): classes.ClassDeclaration[];
    getEnumDeclarations(): enums.EnumDeclaration[];
    getFunctionDeclarations(): functions.FunctionDeclaration[];
    getInterfaceDeclarations(): interfaces.InterfaceDeclaration[];
    getNamespaceDeclarations(): namespaces.NamespaceDeclaration[];
    getVariableStatements(): variable.VariableStatement[];
    getVariableDeclarationLists(): variable.VariableDeclarationList[];
    getVariableDeclarations(): variable.VariableDeclaration[];
}

export function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T {
    return class extends Base implements StatementedNode {
        /**
         * Adds an enum declaration as a child.
         * @param structure - Structure of the enum declaration to add.
         */
        addEnumDeclaration(structure: structures.EnumStructure): enums.EnumDeclaration {
            const sourceFile = this.getRequiredSourceFile();
            const newLineChar = this.factory.getLanguageService().getNewLine();
            this.appendNewLineSeparatorIfNecessary(sourceFile);
            const text = `enum ${structure.name} {${newLineChar}}${newLineChar}`;
            sourceFile.insertText(this.getEnd(), text);

            const mainChildren = this.getMainChildren();
            const declaration = mainChildren[mainChildren.length - 2] as enums.EnumDeclaration;
            for (let member of structure.members || []) {
                declaration.addMember(member);
            }
            return declaration;
        }

        /**
         * Gets the direct class declaration children.
         */
        getClassDeclarations(): classes.ClassDeclaration[] {
            return this.getMainChildrenOfInstance(classes.ClassDeclaration);
        }

        /**
         * Gets the direct enum declaration children.
         */
        getEnumDeclarations(): enums.EnumDeclaration[] {
            return this.getMainChildrenOfInstance(enums.EnumDeclaration);
        }

        /**
         * Gets the direct function declaration children.
         */
        getFunctionDeclarations(): functions.FunctionDeclaration[] {
            return this.getMainChildrenOfInstance(functions.FunctionDeclaration);
        }

        /**
         * Gets the direct interface declaration children.
         */
        getInterfaceDeclarations(): interfaces.InterfaceDeclaration[] {
            return this.getMainChildrenOfInstance(interfaces.InterfaceDeclaration);
        }

        /**
         * Gets the direct namespace declaration children.
         */
        getNamespaceDeclarations(): namespaces.NamespaceDeclaration[] {
            return this.getMainChildrenOfInstance(namespaces.NamespaceDeclaration);
        }

        /**
         * Gets the direct variable statement children.
         */
        getVariableStatements(): variable.VariableStatement[] {
            return this.getMainChildrenOfInstance(variable.VariableStatement);
        }

        /**
         * Gets the variable declaration lists of the direct variable statement children.
         */
        getVariableDeclarationLists(): variable.VariableDeclarationList[] {
            return this.getVariableStatements().map(s => s.getDeclarationList());
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
    };
}
