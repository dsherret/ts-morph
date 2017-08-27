import * as ts from "typescript";
import {getEndIndexFromArray, insertIntoBracesOrSourceFileWithFillAndGetChildren} from "./../../manipulation";
import {ConstructSignatureDeclarationStructure, MethodSignatureStructure, PropertySignatureStructure, InterfaceDeclarationStructure} from "./../../structures";
import {getNamedNodeByNameOrFindFunction} from "./../../utils";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, DocumentationableNode, TypeParameteredNode, HeritageClauseableNode,
    ExtendsClauseableNode, TextInsertableNode} from "./../base";
import {NamespaceChildableNode} from "./../namespace";
import {ConstructSignatureDeclaration} from "./ConstructSignatureDeclaration";
import {MethodSignature} from "./MethodSignature";
import {PropertySignature} from "./PropertySignature";

export type InterfaceMemberTypes = PropertySignature | MethodSignature | ConstructSignatureDeclaration;

export const InterfaceDeclarationBase = TextInsertableNode(ExtendsClauseableNode(HeritageClauseableNode(TypeParameteredNode(DocumentationableNode(AmbientableNode(
    NamespaceChildableNode(ExportableNode(ModifierableNode(NamedNode(Node))))
))))));
export class InterfaceDeclaration extends InterfaceDeclarationBase<ts.InterfaceDeclaration> {
    /**
     * Fills the node from a structure.
     * @param structure - Structure to fill.
     */
    fill(structure: Partial<InterfaceDeclarationStructure>) {
        callBaseFill(InterfaceDeclarationBase.prototype, this, structure);

        if (structure.constructSignatures != null)
            this.addConstructSignatures(structure.constructSignatures);
        if (structure.properties != null)
            this.addProperties(structure.properties);
        if (structure.methods != null)
            this.addMethods(structure.methods);

        return this;
    }

    /**
     * Add construct signature.
     * @param structure - Structure representing the construct signature.
     */
    addConstructSignature(structure: ConstructSignatureDeclarationStructure) {
        return this.addConstructSignatures([structure])[0];
    }

    /**
     * Add construct signatures.
     * @param structures - Structures representing the construct signatures.
     */
    addConstructSignatures(structures: ConstructSignatureDeclarationStructure[]) {
        return this.insertConstructSignatures(getEndIndexFromArray(this.compilerNode.members), structures);
    }

    /**
     * Insert construct signature.
     * @param index - Index to insert at.
     * @param structure - Structure representing the construct signature.
     */
    insertConstructSignature(index: number, structure: ConstructSignatureDeclarationStructure) {
        return this.insertConstructSignatures(index, [structure])[0];
    }

    /**
     * Insert properties.
     * @param index - Index to insert at.
     * @param structures - Structures representing the construct signatures.
     */
    insertConstructSignatures(index: number, structures: ConstructSignatureDeclarationStructure[]) {
        const indentationText = this.getChildIndentationText();

        // create code
        const codes: string[] = [];
        for (const structure of structures) {
            let code = `${indentationText}new()`;
            if (structure.returnType != null && structure.returnType.length > 0)
                code += `: ${structure.returnType}`;
            code += ";";
            codes.push(code);
        }

        return insertIntoBracesOrSourceFileWithFillAndGetChildren<ConstructSignatureDeclaration, ConstructSignatureDeclarationStructure>({
            getIndexedChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: codes,
            structures,
            expectedKind: ts.SyntaxKind.ConstructSignature,
            fillFunction: (node, structure) => node.fill(structure)
        });
    }

    /**
     * Gets the first construct signature by a find function.
     * @param findFunction - Function to find the construct signature by.
     */
    getConstructSignature(findFunction: (member: ConstructSignatureDeclaration) => boolean): ConstructSignatureDeclaration | undefined {
        return this.getConstructSignatures().find(findFunction);
    }

    /**
     * Gets the interface method signatures.
     */
    getConstructSignatures(): ConstructSignatureDeclaration[] {
        return this.compilerNode.members.filter(m => m.kind === ts.SyntaxKind.ConstructSignature)
            .map(m => this.global.compilerFactory.getConstructSignatureDeclaration(m as ts.ConstructSignatureDeclaration, this.sourceFile));
    }

    /**
     * Add method.
     * @param structure - Structure representing the method.
     */
    addMethod(structure: MethodSignatureStructure) {
        return this.addMethods([structure])[0];
    }

    /**
     * Add methods.
     * @param structures - Structures representing the methods.
     */
    addMethods(structures: MethodSignatureStructure[]) {
        return this.insertMethods(getEndIndexFromArray(this.compilerNode.members), structures);
    }

    /**
     * Insert method.
     * @param index - Index to insert at.
     * @param structure - Structure representing the method.
     */
    insertMethod(index: number, structure: MethodSignatureStructure) {
        return this.insertMethods(index, [structure])[0];
    }

    /**
     * Insert methods.
     * @param index - Index to insert at.
     * @param structures - Structures representing the methods.
     */
    insertMethods(index: number, structures: MethodSignatureStructure[]) {
        const indentationText = this.getChildIndentationText();

        // create code
        const codes: string[] = [];
        for (const structure of structures) {
            let code = indentationText;
            code += structure.name;
            if (structure.hasQuestionToken)
                code += "?";
            code += "()";
            if (structure.returnType != null && structure.returnType.length > 0)
                code += `: ${structure.returnType}`;
            code += ";";
            codes.push(code);
        }

        // insert, fill, and get created nodes
        return insertIntoBracesOrSourceFileWithFillAndGetChildren<MethodSignature, MethodSignatureStructure>({
            getIndexedChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: codes,
            structures,
            expectedKind: ts.SyntaxKind.MethodSignature,
            fillFunction: (node, structure) => node.fill(structure)
        });
    }

    /**
     * Gets the first method by name.
     * @param name - Name.
     */
    getMethod(name: string): MethodSignature | undefined;
    /**
     * Gets the first method by a find function.
     * @param findFunction - Function to find the method by.
     */
    getMethod(findFunction: (member: MethodSignature) => boolean): MethodSignature | undefined;
    getMethod(nameOrFindFunction: string | ((member: MethodSignature) => boolean)): MethodSignature | undefined {
        return getNamedNodeByNameOrFindFunction(this.getMethods(), nameOrFindFunction);
    }

    /**
     * Gets the interface method signatures.
     */
    getMethods(): MethodSignature[] {
        return this.compilerNode.members.filter(m => m.kind === ts.SyntaxKind.MethodSignature)
            .map(m => this.global.compilerFactory.getMethodSignature(m as ts.MethodSignature, this.sourceFile));
    }

    /**
     * Add property.
     * @param structure - Structure representing the property.
     */
    addProperty(structure: PropertySignatureStructure) {
        return this.addProperties([structure])[0];
    }

    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addProperties(structures: PropertySignatureStructure[]) {
        return this.insertProperties(getEndIndexFromArray(this.compilerNode.members), structures);
    }

    /**
     * Insert property.
     * @param index - Index to insert at.
     * @param structure - Structure representing the property.
     */
    insertProperty(index: number, structure: PropertySignatureStructure) {
        return this.insertProperties(index, [structure])[0];
    }

    /**
     * Insert properties.
     * @param index - Index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertProperties(index: number, structures: PropertySignatureStructure[]) {
        const indentationText = this.getChildIndentationText();

        // create code
        const codes: string[] = [];
        for (const structure of structures) {
            let code = `${indentationText}`;
            code += structure.name;
            if (structure.hasQuestionToken)
                code += "?";
            if (structure.type != null && structure.type.length > 0)
                code += `: ${structure.type}`;
            code += ";";
            codes.push(code);
        }

        return insertIntoBracesOrSourceFileWithFillAndGetChildren<PropertySignature, PropertySignatureStructure>({
            getIndexedChildren: () => this.getAllMembers(),
            sourceFile: this.getSourceFile(),
            parent: this,
            index,
            childCodes: codes,
            structures,
            expectedKind: ts.SyntaxKind.PropertySignature,
            fillFunction: (node, structure) => node.fill(structure)
        });
    }

    /**
     * Gets the first property by name.
     * @param name - Name.
     */
    getProperty(name: string): PropertySignature | undefined;
    /**
     * Gets the first property by a find function.
     * @param findFunction - Function to find the property by.
     */
    getProperty(findFunction: (member: PropertySignature) => boolean): PropertySignature | undefined;
    getProperty(nameOrFindFunction: string | ((member: PropertySignature) => boolean)): PropertySignature | undefined {
        return getNamedNodeByNameOrFindFunction(this.getProperties(), nameOrFindFunction);
    }

    /**
     * Gets the interface property signatures.
     */
    getProperties(): PropertySignature[] {
        return this.compilerNode.members.filter(m => m.kind === ts.SyntaxKind.PropertySignature)
            .map(m => this.global.compilerFactory.getPropertySignature(m as ts.PropertySignature, this.sourceFile));
    }

    /**
     * Gets all members.
     */
    getAllMembers(): InterfaceMemberTypes[] {
        return this.compilerNode.members.map(m => this.global.compilerFactory.getNodeFromCompilerNode(m, this.sourceFile)) as InterfaceMemberTypes[];
    }
}
