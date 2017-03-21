import * as ts from "typescript";
import * as structures from "./../../structures";
import {Node} from "./../common";
import * as classes from "./../class";
import * as enums from "./../enum";
import * as functions from "./../function";
import * as interfaces from "./../interface";
import * as namespaces from "./../namespace";
import * as types from "./../type";
import * as variable from "./../variable";

export type StatementedNodeExtensionType = Node<ts.SourceFile | ts.FunctionDeclaration | ts.ModuleDeclaration>;

export interface StatementedNode {
    getBody(): Node<ts.Node>;
    addEnumDeclaration(structure: structures.EnumStructure): enums.EnumDeclaration;
    getClassDeclarations(): classes.ClassDeclaration[];
    getEnumDeclarations(): enums.EnumDeclaration[];
    getFunctionDeclarations(): functions.FunctionDeclaration[];
    getInterfaceDeclarations(): interfaces.InterfaceDeclaration[];
    getNamespaceDeclarations(): namespaces.NamespaceDeclaration[];
    getTypeAliasDeclarations(): types.TypeAliasDeclaration[];
    getVariableStatements(): variable.VariableStatement[];
    getVariableDeclarationLists(): variable.VariableDeclarationList[];
    getVariableDeclarations(): variable.VariableDeclaration[];
}

export function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T {
    return class extends Base implements StatementedNode {
        /**
         * Gets the body node or returns the source file if a source file.
         */
        getBody(): Node<ts.Node> {
            if (this.isSourceFile())
                return this;
            else if (this.isNamespaceDeclaration())
                return this.factory.getNodeFromCompilerNode(this.node.body);
            else if (this.isFunctionDeclaration()) {
                if (this.node.body == null)
                    throw new Error("Function declaration has no body.");
                else
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
        addEnumDeclaration(structure: structures.EnumStructure): enums.EnumDeclaration {
            const sourceFile = this.getRequiredSourceFile();
            const newLineChar = this.factory.getLanguageService().getNewLine();
            const indentationText = this.getChildIndentationText(sourceFile);
            this.appendNewLineSeparatorIfNecessary(sourceFile);
            const text = `${indentationText}enum ${structure.name} {${newLineChar}${indentationText}}${newLineChar}`;
            sourceFile.insertText(this.getInsertPosition(), text);

            const enumDeclarations = this.getEnumDeclarations();
            const declaration = enumDeclarations[enumDeclarations.length - 1];
            for (let member of structure.members || []) {
                declaration.addMember(member);
            }
            return declaration;
        }

        /**
         * Gets the direct class declaration children.
         */
        getClassDeclarations(): classes.ClassDeclaration[] {
            return this.getMainChildrenOfKind<classes.ClassDeclaration>(ts.SyntaxKind.ClassDeclaration);
        }

        /**
         * Gets the direct enum declaration children.
         */
        getEnumDeclarations(): enums.EnumDeclaration[] {
            return this.getMainChildrenOfKind<enums.EnumDeclaration>(ts.SyntaxKind.EnumDeclaration);
        }

        /**
         * Gets the direct function declaration children.
         */
        getFunctionDeclarations(): functions.FunctionDeclaration[] {
            return this.getMainChildrenOfKind<functions.FunctionDeclaration>(ts.SyntaxKind.FunctionDeclaration);
        }

        /**
         * Gets the direct interface declaration children.
         */
        getInterfaceDeclarations(): interfaces.InterfaceDeclaration[] {
            return this.getMainChildrenOfKind<interfaces.InterfaceDeclaration>(ts.SyntaxKind.InterfaceDeclaration);
        }

        /**
         * Gets the direct namespace declaration children.
         */
        getNamespaceDeclarations(): namespaces.NamespaceDeclaration[] {
            return this.getMainChildrenOfKind<namespaces.NamespaceDeclaration>(ts.SyntaxKind.ModuleDeclaration);
        }

        /**
         * Gets the direct type alias declaration children.
         */
        getTypeAliasDeclarations(): types.TypeAliasDeclaration[] {
            return this.getMainChildrenOfKind<types.TypeAliasDeclaration>(ts.SyntaxKind.TypeAliasDeclaration);
        }

        /**
         * Gets the direct variable statement children.
         */
        getVariableStatements(): variable.VariableStatement[] {
            return this.getMainChildrenOfKind<variable.VariableStatement>(ts.SyntaxKind.VariableStatement);
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
