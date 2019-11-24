import { errors, ArrayUtils, SyntaxKind, ts } from "@ts-morph/common";
import { getEndIndexFromArray, getNodesToReturn, insertIntoCommaSeparatedNodes, insertIntoParentTextRange, verifyAndGetIndex } from "../../../manipulation";
import { TypeParameterDeclarationStructure, TypeParameteredNodeStructure, OptionalKind } from "../../../structures";
import { Constructor } from "../../../types";
import { getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction } from "../../../utils";
import { NamedNode } from "../base";
import { callBaseSet } from "../callBaseSet";
import { Node } from "../common";
import { TypeParameterDeclaration } from "../type/TypeParameterDeclaration";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type TypeParameteredNodeExtensionType = Node<ts.Node & { typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>; }>;

export interface TypeParameteredNode {
    /**
     * Gets a type parameter or undefined if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getTypeParameter(name: string): TypeParameterDeclaration | undefined;
    /**
     * Gets a type parameter or undefined if it doesn't exist.
     * @param findFunction - Function to use to find the type parameter.
     */
    getTypeParameter(findFunction: (declaration: TypeParameterDeclaration) => boolean): TypeParameterDeclaration | undefined;
    /**
     * Gets a type parameter or throws if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getTypeParameterOrThrow(name: string): TypeParameterDeclaration;
    /**
     * Gets a type parameter or throws if it doesn't exist.
     * @param findFunction - Function to use to find the type parameter.
     */
    getTypeParameterOrThrow(findFunction: (declaration: TypeParameterDeclaration) => boolean): TypeParameterDeclaration;
    /**
     * Gets the type parameters.
     */
    getTypeParameters(): TypeParameterDeclaration[];
    /**
     * Adds a type parameter.
     * @param structure - Structure of the type parameter.
     */
    addTypeParameter(structure: OptionalKind<TypeParameterDeclarationStructure> | string): TypeParameterDeclaration;
    /**
     * Adds type parameters.
     * @param structures - Structures of the type parameters.
     */
    addTypeParameters(structures: ReadonlyArray<OptionalKind<TypeParameterDeclarationStructure> | string>): TypeParameterDeclaration[];
    /**
     * Inserts a type parameter.
     * @param index - Child index to insert at. Specify a negative index to insert from the reverse.
     * @param structure - Structure of the type parameter.
     */
    insertTypeParameter(index: number, structure: OptionalKind<TypeParameterDeclarationStructure> | string): TypeParameterDeclaration;
    /**
     * Inserts type parameters.
     * @param index - Child index to insert at. Specify a negative index to insert from the reverse.
     * @param structures - Structures of the type parameters.
     */
    insertTypeParameters(index: number, structures: ReadonlyArray<OptionalKind<TypeParameterDeclarationStructure> | string>): TypeParameterDeclaration[];
}

export function TypeParameteredNode<T extends Constructor<TypeParameteredNodeExtensionType>>(Base: T): Constructor<TypeParameteredNode> & T {
    return class extends Base implements TypeParameteredNode {
        getTypeParameter(nameOrFindFunction: string | ((declaration: TypeParameterDeclaration) => boolean)): TypeParameterDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getTypeParameters(), nameOrFindFunction);
        }

        getTypeParameterOrThrow(nameOrFindFunction: string | ((declaration: TypeParameterDeclaration) => boolean)): TypeParameterDeclaration {
            return errors.throwIfNullOrUndefined(this.getTypeParameter(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("type parameter", nameOrFindFunction));
        }

        getTypeParameters() {
            const typeParameters = this.compilerNode.typeParameters;
            if (typeParameters == null)
                return [];
            return typeParameters.map(t => this._getNodeFromCompilerNode(t));
        }

        addTypeParameter(structure: OptionalKind<TypeParameterDeclarationStructure> | string) {
            return this.addTypeParameters([structure])[0];
        }

        addTypeParameters(structures: ReadonlyArray<OptionalKind<TypeParameterDeclarationStructure> | string>) {
            return this.insertTypeParameters(getEndIndexFromArray(this.compilerNode.typeParameters), structures);
        }

        insertTypeParameter(index: number, structure: OptionalKind<TypeParameterDeclarationStructure> | string) {
            return this.insertTypeParameters(index, [structure])[0];
        }

        insertTypeParameters(index: number, structures: ReadonlyArray<OptionalKind<TypeParameterDeclarationStructure> | string>) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const typeParameters = this.getTypeParameters();
            const writer = this._getWriterWithQueuedChildIndentation();
            const structurePrinter = this._context.structurePrinterFactory.forTypeParameterDeclaration();
            index = verifyAndGetIndex(index, typeParameters.length);

            structurePrinter.printTexts(writer, structures);

            if (typeParameters.length === 0) {
                insertIntoParentTextRange({
                    insertPos: getInsertPos(this),
                    parent: this,
                    newText: `<${writer.toString()}>`
                });
            }
            else {
                insertIntoCommaSeparatedNodes({
                    parent: this.getFirstChildByKindOrThrow(SyntaxKind.LessThanToken).getNextSiblingIfKindOrThrow(SyntaxKind.SyntaxList),
                    currentNodes: typeParameters,
                    insertIndex: index,
                    newText: writer.toString(),
                    useTrailingCommas: false
                });
            }

            return getNodesToReturn(typeParameters, this.getTypeParameters(), index, false);
        }

        set(structure: Partial<TypeParameteredNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.typeParameters != null) {
                this.getTypeParameters().forEach(t => t.remove());
                this.addTypeParameters(structure.typeParameters);
            }

            return this;
        }

        getStructure() {
            return callBaseGetStructure<TypeParameteredNodeStructure>(Base.prototype, this, {
                typeParameters: this.getTypeParameters().map(p => p.getStructure())
            });
        }
    };
}

function getInsertPos(node: TypeParameteredNode & Node) {
    const namedNode = node as any as (NamedNode & Node);
    if (namedNode.getNameNode != null)
        return namedNode.getNameNode().getEnd();
    else if (Node.isCallSignatureDeclaration(node) || Node.isFunctionTypeNode(node))
        return node.getFirstChildByKindOrThrow(SyntaxKind.OpenParenToken).getStart();
    else
        throw new errors.NotImplementedError(`Not implemented scenario inserting type parameters for node with kind ${node.getKindName()}.`);
}
