import * as ts from "typescript";
import * as structures from "./../../structures";
import {Node} from "./../common";
import * as enums from "./../enum";
import * as variable from "./../variable";
import * as interfaces from "./../interface";

export type StatementedNodeExtensionType = Node<ts.SourceFile>;

export interface StatementedNode extends StatementedNodeExtensionType {
    addEnumDeclaration(structure: structures.EnumStructure): enums.EnumDeclaration;
    getEnumDeclarations(): enums.EnumDeclaration[];
    getInterfaceDeclarations(): interfaces.InterfaceDeclaration[];
    getVariableStatements(): variable.VariableStatement[];
    getVariableDeclarationLists(): variable.VariableDeclarationList[];
    getVariableDeclarations(): variable.VariableDeclaration[];
}

export function StatementedNode<T extends Constructor<StatementedNodeExtensionType>>(Base: T): Constructor<StatementedNode> & T {
    return class extends Base implements StatementedNode {
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

        getEnumDeclarations(): enums.EnumDeclaration[] {
            return this.getMainChildren().filter(c => c instanceof enums.EnumDeclaration) as enums.EnumDeclaration[];
        }

        getInterfaceDeclarations(): interfaces.InterfaceDeclaration[] {
            return this.getMainChildren().filter(c => c instanceof interfaces.InterfaceDeclaration) as interfaces.InterfaceDeclaration[];
        }

        getVariableStatements(): variable.VariableStatement[] {
            return this.getMainChildren().filter(c => c instanceof variable.VariableStatement) as variable.VariableStatement[];
        }

        getVariableDeclarationLists(): variable.VariableDeclarationList[] {
            return this.getVariableStatements().map(s => s.getDeclarationList());
        }

        getVariableDeclarations(): variable.VariableDeclaration[] {
            const variables: variable.VariableDeclaration[] = [];

            for (let list of this.getVariableDeclarationLists()) {
                variables.push(...list.getDeclarations());
            }

            return variables;
        }
    };
}
