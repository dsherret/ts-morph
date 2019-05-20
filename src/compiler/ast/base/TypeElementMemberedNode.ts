import { CodeBlockWriter } from "../../../codeBlockWriter";
import * as errors from "../../../errors";
import { getEndIndexFromArray, insertIntoBracesOrSourceFileWithGetChildren } from "../../../manipulation";
import { CallSignatureDeclarationStructure, ConstructSignatureDeclarationStructure, IndexSignatureDeclarationStructure, MethodSignatureStructure,
    PropertySignatureStructure, TypeElementMemberedNodeStructure, OptionalKind, Structure } from "../../../structures";
import { Constructor } from "../../../types";
import { SyntaxKind, ts } from "../../../typescript";
import { getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction } from "../../../utils";
import { TypeElementTypes } from "../aliases";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { CallSignatureDeclaration, ConstructSignatureDeclaration, IndexSignatureDeclaration, MethodSignature, PropertySignature, CommentTypeElement } from "../interface";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { ExtendedParser } from "../utils";

export type TypeElementMemberedNodeExtensionType = Node<ts.Node & { members: ts.NodeArray<ts.TypeElement>; }>;

export interface TypeElementMemberedNode {
    /**
     * Add construct signature.
     * @param structure - Structure representing the construct signature.
     */
    addConstructSignature(structure: OptionalKind<ConstructSignatureDeclarationStructure>): ConstructSignatureDeclaration;
    /**
     * Add construct signatures.
     * @param structures - Structures representing the construct signatures.
     */
    addConstructSignatures(structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>>): ConstructSignatureDeclaration[];
    /**
     * Insert construct signature.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the construct signature.
     */
    insertConstructSignature(index: number, structure: OptionalKind<ConstructSignatureDeclarationStructure>): ConstructSignatureDeclaration;
    /**
     * Insert construct signatures.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the construct signatures.
     */
    insertConstructSignatures(index: number, structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>>): ConstructSignatureDeclaration[];
    /**
     * Gets the first construct signature by a find function.
     * @param findFunction - Function to find the construct signature by.
     */
    getConstructSignature(findFunction: (member: ConstructSignatureDeclaration) => boolean): ConstructSignatureDeclaration | undefined;
    /**
     * Gets the first construct signature by a find function or throws if not found.
     * @param findFunction - Function to find the construct signature by.
     */
    getConstructSignatureOrThrow(findFunction: (member: ConstructSignatureDeclaration) => boolean): ConstructSignatureDeclaration;
    /**
     * Gets the interface construct signatures.
     */
    getConstructSignatures(): ConstructSignatureDeclaration[];

    /**
     * Add call signature.
     * @param structure - Structure representing the call signature.
     */
    addCallSignature(structure: OptionalKind<CallSignatureDeclarationStructure>): CallSignatureDeclaration;
    /**
     * Add call signatures.
     * @param structures - Structures representing the call signatures.
     */
    addCallSignatures(structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>>): CallSignatureDeclaration[];
    /**
     * Insert call signature.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the call signature.
     */
    insertCallSignature(index: number, structure: OptionalKind<CallSignatureDeclarationStructure>): CallSignatureDeclaration;
    /**
     * Insert call signatures.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the call signatures.
     */
    insertCallSignatures(index: number, structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>>): CallSignatureDeclaration[];
    /**
     * Gets the first call signature by a find function.
     * @param findFunction - Function to find the call signature by.
     */
    getCallSignature(findFunction: (member: CallSignatureDeclaration) => boolean): CallSignatureDeclaration | undefined;
    /**
     * Gets the first call signature by a find function or throws if not found.
     * @param findFunction - Function to find the call signature by.
     */
    getCallSignatureOrThrow(findFunction: (member: CallSignatureDeclaration) => boolean): CallSignatureDeclaration;
    /**
     * Gets the interface call signatures.
     */
    getCallSignatures(): CallSignatureDeclaration[];

    /**
     * Add index signature.
     * @param structure - Structure representing the index signature.
     */
    addIndexSignature(structure: OptionalKind<IndexSignatureDeclarationStructure>): IndexSignatureDeclaration;
    /**
     * Add index signatures.
     * @param structures - Structures representing the index signatures.
     */
    addIndexSignatures(structures: ReadonlyArray<OptionalKind<IndexSignatureDeclarationStructure>>): IndexSignatureDeclaration[];
    /**
     * Insert index signature.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the index signature.
     */
    insertIndexSignature(index: number, structure: OptionalKind<IndexSignatureDeclarationStructure>): IndexSignatureDeclaration;
    /**
     * Insert index signatures.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the index signatures.
     */
    insertIndexSignatures(index: number, structures: ReadonlyArray<OptionalKind<IndexSignatureDeclarationStructure>>): IndexSignatureDeclaration[];
    /**
     * Gets the first index signature by a find function.
     * @param findFunction - Function to find the index signature by.
     */
    getIndexSignature(findFunction: (member: IndexSignatureDeclaration) => boolean): IndexSignatureDeclaration | undefined;
    /**
     * Gets the first index signature by a find function or throws if not found.
     * @param findFunction - Function to find the index signature by.
     */
    getIndexSignatureOrThrow(findFunction: (member: IndexSignatureDeclaration) => boolean): IndexSignatureDeclaration;
    /**
     * Gets the interface index signatures.
     */
    getIndexSignatures(): IndexSignatureDeclaration[];

    /**
     * Add method.
     * @param structure - Structure representing the method.
     */
    addMethod(structure: OptionalKind<MethodSignatureStructure>): MethodSignature;
    /**
     * Add methods.
     * @param structures - Structures representing the methods.
     */
    addMethods(structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>>): MethodSignature[];
    /**
     * Insert method.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the method.
     */
    insertMethod(index: number, structure: OptionalKind<MethodSignatureStructure>): MethodSignature;
    /**
     * Insert methods.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the methods.
     */
    insertMethods(index: number, structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>>): MethodSignature[];
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
    /**
     * Gets the interface method signatures.
     */
    getMethods(): MethodSignature[];

    /**
     * Add property.
     * @param structure - Structure representing the property.
     */
    addProperty(structure: OptionalKind<PropertySignatureStructure>): PropertySignature;
    /**
     * Add properties.
     * @param structures - Structures representing the properties.
     */
    addProperties(structures: ReadonlyArray<OptionalKind<PropertySignatureStructure>>): PropertySignature[];
    /**
     * Insert property.
     * @param index - Child index to insert at.
     * @param structure - Structure representing the property.
     */
    insertProperty(index: number, structure: OptionalKind<PropertySignatureStructure>): PropertySignature;
    /**
     * Insert properties.
     * @param index - Child index to insert at.
     * @param structures - Structures representing the properties.
     */
    insertProperties(index: number, structures: ReadonlyArray<OptionalKind<PropertySignatureStructure>>): PropertySignature[];
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
    /**
     * Gets the interface property signatures.
     */
    getProperties(): PropertySignature[];
    /**
     * Gets all the members.
     */
    getMembers(): TypeElementTypes[];
    /**
     * Gets all the members with comment type elements.
     */
    getMembersWithComments(): (TypeElementTypes | CommentTypeElement)[];
}

export function TypeElementMemberedNode<T extends Constructor<TypeElementMemberedNodeExtensionType>>(Base: T): Constructor<TypeElementMemberedNode> & T {
    return class extends Base implements TypeElementMemberedNode {
        addConstructSignature(structure: OptionalKind<ConstructSignatureDeclarationStructure>) {
            return this.addConstructSignatures([structure])[0];
        }

        addConstructSignatures(structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>>) {
            return this.insertConstructSignatures(getEndIndexFromArray(this.getMembersWithComments()), structures);
        }

        insertConstructSignature(index: number, structure: OptionalKind<ConstructSignatureDeclarationStructure>) {
            return this.insertConstructSignatures(index, [structure])[0];
        }

        insertConstructSignatures(index: number, structures: ReadonlyArray<OptionalKind<ConstructSignatureDeclarationStructure>>): ConstructSignatureDeclaration[] {
            return insertChildren({
                thisNode: this,
                index,
                structures,
                expectedKind: SyntaxKind.ConstructSignature,
                createStructurePrinter: () => this._context.structurePrinterFactory.forConstructSignatureDeclaration()
            });
        }

        getConstructSignature(findFunction: (member: ConstructSignatureDeclaration) => boolean) {
            return this.getConstructSignatures().find(findFunction);
        }

        getConstructSignatureOrThrow(findFunction: (member: ConstructSignatureDeclaration) => boolean) {
            return errors.throwIfNullOrUndefined(this.getConstructSignature(findFunction), "Expected to find a construct signature with the provided condition.");
        }

        getConstructSignatures() {
            return this.compilerNode.members.filter(m => m.kind === SyntaxKind.ConstructSignature)
                .map(m => this._getNodeFromCompilerNode(m as ts.ConstructSignatureDeclaration));
        }

        addCallSignature(structure: OptionalKind<CallSignatureDeclarationStructure>) {
            return this.addCallSignatures([structure])[0];
        }

        addCallSignatures(structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>>) {
            return this.insertCallSignatures(getEndIndexFromArray(this.getMembersWithComments()), structures);
        }

        insertCallSignature(index: number, structure: OptionalKind<CallSignatureDeclarationStructure>) {
            return this.insertCallSignatures(index, [structure])[0];
        }

        insertCallSignatures(index: number, structures: ReadonlyArray<OptionalKind<CallSignatureDeclarationStructure>>): CallSignatureDeclaration[] {
            return insertChildren({
                thisNode: this,
                index,
                structures,
                expectedKind: SyntaxKind.CallSignature,
                createStructurePrinter: () => this._context.structurePrinterFactory.forCallSignatureDeclaration()
            });
        }

        getCallSignature(findFunction: (member: CallSignatureDeclaration) => boolean) {
            return this.getCallSignatures().find(findFunction);
        }

        getCallSignatureOrThrow(findFunction: (member: CallSignatureDeclaration) => boolean) {
            return errors.throwIfNullOrUndefined(this.getCallSignature(findFunction), "Expected to find a call signature with the provided condition.");
        }

        getCallSignatures() {
            return this.compilerNode.members.filter(m => m.kind === SyntaxKind.CallSignature)
                .map(m => this._getNodeFromCompilerNode(m as ts.CallSignatureDeclaration));
        }

        addIndexSignature(structure: OptionalKind<IndexSignatureDeclarationStructure>) {
            return this.addIndexSignatures([structure])[0];
        }

        addIndexSignatures(structures: ReadonlyArray<OptionalKind<IndexSignatureDeclarationStructure>>) {
            return this.insertIndexSignatures(getEndIndexFromArray(this.getMembersWithComments()), structures);
        }

        insertIndexSignature(index: number, structure: OptionalKind<IndexSignatureDeclarationStructure>) {
            return this.insertIndexSignatures(index, [structure])[0];
        }

        insertIndexSignatures(index: number, structures: ReadonlyArray<OptionalKind<IndexSignatureDeclarationStructure>>): IndexSignatureDeclaration[] {
            return insertChildren({
                thisNode: this,
                index,
                structures,
                expectedKind: SyntaxKind.IndexSignature,
                createStructurePrinter: () => this._context.structurePrinterFactory.forIndexSignatureDeclaration()
            });
        }

        getIndexSignature(findFunction: (member: IndexSignatureDeclaration) => boolean) {
            return this.getIndexSignatures().find(findFunction);
        }

        getIndexSignatureOrThrow(findFunction: (member: IndexSignatureDeclaration) => boolean) {
            return errors.throwIfNullOrUndefined(this.getIndexSignature(findFunction), "Expected to find a index signature with the provided condition.");
        }

        getIndexSignatures() {
            return this.compilerNode.members.filter(m => m.kind === SyntaxKind.IndexSignature)
                .map(m => this._getNodeFromCompilerNode(m as ts.IndexSignatureDeclaration));
        }

        addMethod(structure: OptionalKind<MethodSignatureStructure>) {
            return this.addMethods([structure])[0];
        }

        addMethods(structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>>) {
            return this.insertMethods(getEndIndexFromArray(this.getMembersWithComments()), structures);
        }

        insertMethod(index: number, structure: OptionalKind<MethodSignatureStructure>) {
            return this.insertMethods(index, [structure])[0];
        }

        insertMethods(index: number, structures: ReadonlyArray<OptionalKind<MethodSignatureStructure>>): MethodSignature[] {
            return insertChildren({
                thisNode: this,
                index,
                structures,
                expectedKind: SyntaxKind.MethodSignature,
                createStructurePrinter: () => this._context.structurePrinterFactory.forMethodSignature()
            });
        }

        getMethod(nameOrFindFunction: string | ((member: MethodSignature) => boolean)) {
            return getNodeByNameOrFindFunction(this.getMethods(), nameOrFindFunction);
        }

        getMethodOrThrow(nameOrFindFunction: string | ((member: MethodSignature) => boolean)) {
            return errors.throwIfNullOrUndefined(this.getMethod(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("interface method signature", nameOrFindFunction));
        }

        getMethods() {
            return this.compilerNode.members.filter(m => m.kind === SyntaxKind.MethodSignature)
                .map(m => this._getNodeFromCompilerNode(m as ts.MethodSignature));
        }

        addProperty(structure: OptionalKind<PropertySignatureStructure>) {
            return this.addProperties([structure])[0];
        }

        addProperties(structures: ReadonlyArray<OptionalKind<PropertySignatureStructure>>) {
            return this.insertProperties(getEndIndexFromArray(this.getMembersWithComments()), structures);
        }

        insertProperty(index: number, structure: OptionalKind<PropertySignatureStructure>) {
            return this.insertProperties(index, [structure])[0];
        }

        insertProperties(index: number, structures: ReadonlyArray<OptionalKind<PropertySignatureStructure>>): PropertySignature[] {
            return insertChildren({
                thisNode: this,
                index,
                structures,
                expectedKind: SyntaxKind.PropertySignature,
                createStructurePrinter: () => this._context.structurePrinterFactory.forPropertySignature()
            });
        }

        getProperty(nameOrFindFunction: string | ((member: PropertySignature) => boolean)): PropertySignature | undefined {
            return getNodeByNameOrFindFunction(this.getProperties(), nameOrFindFunction);
        }

        getPropertyOrThrow(nameOrFindFunction: string | ((member: PropertySignature) => boolean)): PropertySignature {
            return errors.throwIfNullOrUndefined(this.getProperty(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("interface property signature", nameOrFindFunction));
        }

        getProperties() {
            return this.compilerNode.members.filter(m => m.kind === SyntaxKind.PropertySignature)
                .map(m => this._getNodeFromCompilerNode(m as ts.PropertySignature));
        }

        getMembers() {
            return this.compilerNode.members.map(m => this._getNodeFromCompilerNode(m)) as TypeElementTypes[];
        }

        getMembersWithComments() {
            const compilerNode = this.compilerNode as (ts.InterfaceDeclaration | ts.TypeLiteralNode);
            return ExtendedParser.getContainerArray(compilerNode, this._sourceFile.compilerNode)
                .map(m => this._getNodeFromCompilerNode(m)) as (TypeElementTypes | CommentTypeElement)[];
        }

        set(structure: Partial<TypeElementMemberedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.callSignatures != null) {
                this.getCallSignatures().forEach(c => c.remove());
                this.addCallSignatures(structure.callSignatures);
            }
            if (structure.constructSignatures != null) {
                this.getConstructSignatures().forEach(c => c.remove());
                this.addConstructSignatures(structure.constructSignatures);
            }
            if (structure.indexSignatures != null) {
                this.getIndexSignatures().forEach(c => c.remove());
                this.addIndexSignatures(structure.indexSignatures);
            }
            if (structure.properties != null) {
                this.getProperties().forEach(c => c.remove());
                this.addProperties(structure.properties);
            }
            if (structure.methods != null) {
                this.getMethods().forEach(c => c.remove());
                this.addMethods(structure.methods);
            }

            return this;
        }

        getStructure() {
            return callBaseGetStructure<TypeElementMemberedNodeStructure>(Base.prototype, this, {
                callSignatures: this.getCallSignatures().map(node => node.getStructure()),
                constructSignatures: this.getConstructSignatures().map(node => node.getStructure()),
                indexSignatures: this.getIndexSignatures().map(node => node.getStructure()),
                methods: this.getMethods().map(node => node.getStructure()),
                properties: this.getProperties().map(node => node.getStructure())
            });
        }
    };
}

function insertChildren<TNode extends Node, TStructure extends Structure>(opts: {
    thisNode: Node & TypeElementMemberedNode,
    index: number;
    structures: ReadonlyArray<TStructure>;
    expectedKind: SyntaxKind;
    createStructurePrinter: () => ({ printTexts(writer: CodeBlockWriter, structures: ReadonlyArray<TStructure>): void; });
}): TNode[] {
    return insertIntoBracesOrSourceFileWithGetChildren<TNode>({
        getIndexedChildren: () => opts.thisNode.getMembersWithComments(),
        parent: opts.thisNode,
        index: opts.index,
        structures: opts.structures,
        expectedKind: opts.expectedKind,
        write: (writer, info) => {
            writer.newLineIfLastNot();
            opts.createStructurePrinter().printTexts(writer, opts.structures);
            writer.newLineIfLastNot();
        }
    });
}
