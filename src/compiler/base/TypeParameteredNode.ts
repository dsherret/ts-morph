import {ts, SyntaxKind} from "./../../typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {insertIntoCommaSeparatedNodes, getEndIndexFromArray, verifyAndGetIndex, insertIntoParentTextRange,
    getNodesToReturn} from "./../../manipulation";
import {TypeParameteredNodeStructure, TypeParameterDeclarationStructure} from "./../../structures";
import {ArrayUtils, getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction, TypeGuards} from "./../../utils";
import {callBaseFill} from "./../callBaseFill";
import {NamedNode} from "./../base";
import {Node} from "./../common";
import {TypeParameterDeclaration} from "./../type/TypeParameterDeclaration";

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
    addTypeParameter(structure: TypeParameterDeclarationStructure): TypeParameterDeclaration;
    /**
     * Adds type parameters.
     * @param structures - Structures of the type parameters.
     */
    addTypeParameters(structures: TypeParameterDeclarationStructure[]): TypeParameterDeclaration[];
    /**
     * Inserts a type parameter.
     * @param index - Index to insert at. Specify a negative index to insert from the reverse.
     * @param structure - Structure of the type parameter.
     */
    insertTypeParameter(index: number, structure: TypeParameterDeclarationStructure): TypeParameterDeclaration;
    /**
     * Inserts type parameters.
     * @param index - Index to insert at. Specify a negative index to insert from the reverse.
     * @param structures - Structures of the type parameters.
     */
    insertTypeParameters(index: number, structures: TypeParameterDeclarationStructure[]): TypeParameterDeclaration[];
}

export function TypeParameteredNode<T extends Constructor<TypeParameteredNodeExtensionType>>(Base: T): Constructor<TypeParameteredNode> & T {
    return class extends Base implements TypeParameteredNode {
        getTypeParameter(nameOrFindFunction: string | ((declaration: TypeParameterDeclaration) => boolean)): TypeParameterDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getTypeParameters(), nameOrFindFunction);
        }

        getTypeParameterOrThrow(nameOrFindFunction: string | ((declaration: TypeParameterDeclaration) => boolean)): TypeParameterDeclaration {
            return errors.throwIfNullOrUndefined(this.getTypeParameter(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("type parameter", nameOrFindFunction));
        }

        getTypeParameters() {
            const typeParameters = this.compilerNode.typeParameters;
            if (typeParameters == null)
                return [];
            return typeParameters.map(t => this.getNodeFromCompilerNode<TypeParameterDeclaration>(t));
        }

        addTypeParameter(structure: TypeParameterDeclarationStructure) {
            return this.addTypeParameters([structure])[0];
        }

        addTypeParameters(structures: TypeParameterDeclarationStructure[]) {
            return this.insertTypeParameters(getEndIndexFromArray(this.compilerNode.typeParameters), structures);
        }

        insertTypeParameter(index: number, structure: TypeParameterDeclarationStructure) {
            return this.insertTypeParameters(index, [structure])[0];
        }

        insertTypeParameters(index: number, structures: TypeParameterDeclarationStructure[]) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const typeParameters = this.getTypeParameters();
            const typeParamCodes = structures.map(s => getStructureCode(s));
            index = verifyAndGetIndex(index, typeParameters.length);

            if (typeParameters.length === 0) {
                insertIntoParentTextRange({
                    insertPos: getInsertPos(this),
                    parent: this,
                    newText: `<${typeParamCodes.join(", ")}>`
                });
            }
            else {
                insertIntoCommaSeparatedNodes({
                    parent: this.getFirstChildByKindOrThrow(SyntaxKind.LessThanToken).getNextSiblingIfKindOrThrow(SyntaxKind.SyntaxList),
                    currentNodes: typeParameters,
                    insertIndex: index,
                    newTexts: typeParamCodes
                });
            }

            return getNodesToReturn(this.getTypeParameters(), index, structures.length);
        }

        fill(structure: Partial<TypeParameteredNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.typeParameters != null && structure.typeParameters.length > 0)
                this.addTypeParameters(structure.typeParameters);

            return this;
        }
    };
}

function getStructureCode(structure: TypeParameterDeclarationStructure) {
    let code = structure.name;
    if (structure.constraint != null && structure.constraint.length > 0)
        code += ` extends ${structure.constraint}`;
    return code;
}

function getInsertPos(node: TypeParameteredNode & Node) {
    const namedNode = node as any as (NamedNode & Node);
    if (namedNode.getNameNode != null)
        return namedNode.getNameNode().getEnd();
    else if (TypeGuards.isCallSignatureDeclaration(node) || TypeGuards.isFunctionTypeNode(node))
        return node.getFirstChildByKindOrThrow(SyntaxKind.OpenParenToken).getStart();
    else
        throw new errors.NotImplementedError(`Not implemented scenario inserting type parameters for node with kind ${node.getKindName()}.`);
}
