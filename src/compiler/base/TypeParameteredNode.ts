import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {insertIntoCommaSeparatedNodes, getEndIndexFromArray, verifyAndGetIndex, insertIntoParent} from "./../../manipulation";
import {TypeParameteredNodeStructure, TypeParameterDeclarationStructure} from "./../../structures";
import {ArrayUtils} from "./../../utils";
import {callBaseFill} from "./../callBaseFill";
import {NamedNode} from "./../base";
import {Node} from "./../common";
import {TypeParameterDeclaration} from "./../type/TypeParameterDeclaration";

export type TypeParameteredNodeExtensionType = Node<ts.Node & { typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>; }>;

export interface TypeParameteredNode {
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
        getTypeParameters() {
            const typeParameters = (this.compilerNode.typeParameters || []) as ts.TypeParameterDeclaration[]; // why do I need this assert?
            return typeParameters.map(t => this.global.compilerFactory.getNodeFromCompilerNode(t, this.sourceFile) as TypeParameterDeclaration);
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
                const nameNode = getNamedNode(this).getNameNode();
                insertIntoParent({
                    insertPos: nameNode.getEnd(),
                    childIndex: nameNode.getChildIndex() + 1,
                    insertItemsCount: 3, // FirstBinaryOperator, SyntaxList, GreaterThanToken
                    parent: this,
                    newText: `<${typeParamCodes.join(", ")}>`
                });
            }
            else {
                insertIntoCommaSeparatedNodes({
                    parent: this.getFirstChildByKindOrThrow(ts.SyntaxKind.FirstBinaryOperator).getNextSiblingIfKindOrThrow(ts.SyntaxKind.SyntaxList),
                    currentNodes: typeParameters,
                    insertIndex: index,
                    newTexts: typeParamCodes
                });
            }

            return this.getTypeParameters().slice(index, index + structures.length);
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

function getNamedNode(node: TypeParameteredNode) {
    const namedNode = node as any as NamedNode;

    /* istanbul ignore if */
    if (namedNode.getNameNode == null)
        throw new errors.NotImplementedError("Not implemented scenario. Type parameters can only be added to a node with a name.");

    return namedNode;
}
