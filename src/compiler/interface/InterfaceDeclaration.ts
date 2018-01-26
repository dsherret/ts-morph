import * as ts from "typescript";
import {getEndIndexFromArray, insertIntoBracesOrSourceFileWithFillAndGetChildren, removeStatementedNodeChild} from "./../../manipulation";
import * as errors from "./../../errors";
import {ConstructSignatureDeclarationStructure, MethodSignatureStructure, PropertySignatureStructure, InterfaceDeclarationStructure} from "./../../structures";
import {getNamedNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction, ArrayUtils} from "./../../utils";
import * as structureToTexts from "./../../structureToTexts";
import {callBaseFill} from "./../callBaseFill";
import {Node} from "./../common";
import {NamedNode, ExportableNode, ModifierableNode, AmbientableNode, JSDocableNode, TypeParameteredNode, HeritageClauseableNode,
    ExtendsClauseableNode, TextInsertableNode, ChildOrderableNode} from "./../base";
import {ClassDeclaration} from "./../class";
import {NamespaceChildableNode} from "./../namespace";
import {Type, TypeAliasDeclaration} from "./../type";
import {ImplementationLocation} from "./../tools";
import {ConstructSignatureDeclaration} from "./ConstructSignatureDeclaration";
import {MethodSignature} from "./MethodSignature";
import {PropertySignature} from "./PropertySignature";

export type InterfaceMemberTypes = PropertySignature | MethodSignature | ConstructSignatureDeclaration;

export const InterfaceDeclarationBase = ChildOrderableNode(TextInsertableNode(ExtendsClauseableNode(HeritageClauseableNode(TypeParameteredNode(
    JSDocableNode(AmbientableNode(NamespaceChildableNode(ExportableNode(ModifierableNode(NamedNode(Node))))))
)))));
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
     * Gets the base types.
     */
    getBaseTypes(): Type[] {
        return this.getType().getBaseTypes();
    }

    /**
     * Gets the base declarations.
     */
    getBaseDeclarations(): (TypeAliasDeclaration | InterfaceDeclaration | ClassDeclaration)[] {
        return ArrayUtils.flatten(this.getType().getBaseTypes().map(t => {
            const symbol = t.getSymbol();
            return symbol == null ? [] : (symbol.getDeclarations() as (TypeAliasDeclaration | InterfaceDeclaration | ClassDeclaration)[]);
        }));
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
        const codes = structures.map(s => {
            // todo: pass in the StructureToText to the function below
            const writer = this.getWriterWithChildIndentation();
            const structureToText = new structureToTexts.ConstructSignatureDeclarationStructureToText(writer);
            structureToText.writeText(s);
            return writer.toString();
        });

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
        return ArrayUtils.find(this.getConstructSignatures(), findFunction);
    }

    /**
     * Gets the first construct signature by a find function or throws if not found.
     * @param findFunction - Function to find the construct signature by.
     */
    getConstructSignatureOrThrow(findFunction: (member: ConstructSignatureDeclaration) => boolean): ConstructSignatureDeclaration {
        return errors.throwIfNullOrUndefined(this.getConstructSignature(findFunction), "Expected to find a construct signature with the provided condition.");
    }

    /**
     * Gets the interface method signatures.
     */
    getConstructSignatures(): ConstructSignatureDeclaration[] {
        return this.compilerNode.members.filter(m => m.kind === ts.SyntaxKind.ConstructSignature)
            .map(m => this.getNodeFromCompilerNode(m as ts.ConstructSignatureDeclaration)) as ConstructSignatureDeclaration[];
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
        const codes = structures.map(s => {
            // todo: pass in the StructureToText to the function below
            const writer = this.getWriterWithChildIndentation();
            const structureToText = new structureToTexts.MethodSignatureStructureToText(writer);
            structureToText.writeText(s);
            return writer.toString();
        });

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
    /** @internal */
    getMethod(nameOrFindFunction: string | ((member: MethodSignature) => boolean)): MethodSignature | undefined;
    getMethod(nameOrFindFunction: string | ((member: MethodSignature) => boolean)): MethodSignature | undefined {
        return getNamedNodeByNameOrFindFunction(this.getMethods(), nameOrFindFunction);
    }

    /**
     * Gets the first method by name or throws if not found.
     * @param name - Name.
     */
    getMethodOrThrow(name: string): MethodSignature;
    /**
     * Gets the first method by a find function or throws if not found.
     * @param findFunction - Function to find the method by.
     */
    getMethodOrThrow(findFunction: (member: MethodSignature) => boolean): MethodSignature;
    getMethodOrThrow(nameOrFindFunction: string | ((member: MethodSignature) => boolean)): MethodSignature {
        return errors.throwIfNullOrUndefined(this.getMethod(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("interface method signature", nameOrFindFunction));
    }

    /**
     * Gets the interface method signatures.
     */
    getMethods(): MethodSignature[] {
        return this.compilerNode.members.filter(m => m.kind === ts.SyntaxKind.MethodSignature)
            .map(m => this.getNodeFromCompilerNode(m as ts.MethodSignature) as MethodSignature);
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
        const codes = structures.map(s => {
            // todo: pass in the StructureToText to the function below
            const writer = this.getWriterWithChildIndentation();
            const structureToText = new structureToTexts.PropertySignatureStructureToText(writer);
            structureToText.writeText(s);
            return writer.toString();
        });

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
    /** @internal */
    getProperty(nameOrFindFunction: string | ((member: PropertySignature) => boolean)): PropertySignature | undefined;
    getProperty(nameOrFindFunction: string | ((member: PropertySignature) => boolean)): PropertySignature | undefined {
        return getNamedNodeByNameOrFindFunction(this.getProperties(), nameOrFindFunction);
    }

    /**
     * Gets the first property by name or throws if not found.
     * @param name - Name.
     */
    getPropertyOrThrow(name: string): PropertySignature;
    /**
     * Gets the first property by a find function or throws if not found.
     * @param findFunction - Function to find the property by.
     */
    getPropertyOrThrow(findFunction: (member: PropertySignature) => boolean): PropertySignature;
    getPropertyOrThrow(nameOrFindFunction: string | ((member: PropertySignature) => boolean)): PropertySignature {
        return errors.throwIfNullOrUndefined(this.getProperty(nameOrFindFunction),
            () => getNotFoundErrorMessageForNameOrFindFunction("interface property signature", nameOrFindFunction));
    }

    /**
     * Gets the interface property signatures.
     */
    getProperties(): PropertySignature[] {
        return this.compilerNode.members.filter(m => m.kind === ts.SyntaxKind.PropertySignature)
            .map(m => this.getNodeFromCompilerNode(m as ts.PropertySignature) as PropertySignature);
    }

    /**
     * Gets all members.
     */
    getAllMembers(): InterfaceMemberTypes[] {
        return this.compilerNode.members.map(m => this.getNodeFromCompilerNode(m)) as InterfaceMemberTypes[];
    }

    /**
     * Gets all the implementations of the interface.
     *
     * This is similar to "go to implementation."
     */
    getImplementations(): ImplementationLocation[] {
        return this.getNameNode().getImplementations();
    }

    /**
     * Removes this interface declaration.
     */
    remove() {
        removeStatementedNodeChild(this);
    }
}
