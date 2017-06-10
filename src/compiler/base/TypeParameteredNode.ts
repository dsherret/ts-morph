import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertIntoCommaSeparatedNodes, getEndIndexFromArray, verifyAndGetIndex, insertStraight} from "./../../manipulation";
import {ArrayUtils} from "./../../utils";
import {NamedNode} from "./../base";
import {Node} from "./../common";
import {TypeParameterDeclaration} from "./../type/TypeParameterDeclaration";
import {TypeParameterDeclarationStructure} from "./../../structures";

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
            const typeParameters = (this.node.typeParameters || []) as ts.TypeParameterDeclaration[]; // why do I need this assert?
            return typeParameters.map(t => this.factory.getTypeParameterDeclaration(t, this.sourceFile));
        }

        addTypeParameter(structure: TypeParameterDeclarationStructure) {
            return this.addTypeParameters([structure])[0];
        }

        addTypeParameters(structures: TypeParameterDeclarationStructure[]) {
            return this.insertTypeParameters(getEndIndexFromArray(this.node.typeParameters), structures);
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
                const insertPos = getNamedNode(this).getNameNode().getEnd();
                insertStraight(this.getSourceFile(), insertPos, this, `<${typeParamCodes.join(", ")}>`);
            }
            else {
                insertIntoCommaSeparatedNodes(this.getSourceFile(), typeParameters, index, typeParamCodes);
            }

            return this.getTypeParameters().slice(index, index + structures.length);
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
