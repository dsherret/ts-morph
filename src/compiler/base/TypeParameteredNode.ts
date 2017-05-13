import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertIntoCommaSeparatedNodes, getEndIndexFromArray, verifyAndGetIndex} from "./../../manipulation";
import {ArrayUtils} from "./../../utils";
import {NamedNode} from "./../base";
import {Node} from "./../common";
import {SourceFile} from "./../file";
import {TypeParameterDeclaration} from "./../type/TypeParameterDeclaration";
import {TypeParameterStructure} from "./../../structures";

export type TypeParameteredNodeExtensionType = Node<ts.Node & { typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>; }>;

export interface TypeParameteredNode {
    getTypeParameters(): TypeParameterDeclaration[];
    addTypeParameter(structure: TypeParameterStructure, sourceFile?: SourceFile): TypeParameterDeclaration;
    addTypeParameters(structures: TypeParameterStructure[], sourceFile?: SourceFile): TypeParameterDeclaration[];
    insertTypeParameter(index: number, structure: TypeParameterStructure, sourceFile?: SourceFile): TypeParameterDeclaration;
    insertTypeParameters(index: number, structures: TypeParameterStructure[], sourceFile?: SourceFile): TypeParameterDeclaration[];
}

export function TypeParameteredNode<T extends Constructor<TypeParameteredNodeExtensionType>>(Base: T): Constructor<TypeParameteredNode> & T {
    return class extends Base implements TypeParameteredNode {
        /**
         * Gets the type parameters.
         */
        getTypeParameters() {
            const typeParameters = (this.node.typeParameters || []) as ts.TypeParameterDeclaration[]; // why do I need this assert?
            return typeParameters.map(t => this.factory.getTypeParameterDeclaration(t));
        }

        /**
         * Adds a type parameter.
         * @param structure - Structure of the type parameter.
         * @param sourceFile - Optional source file to help with performance.
         */
        addTypeParameter(structure: TypeParameterStructure, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            return this.insertTypeParameter(getEndIndexFromArray(this.node.typeParameters), structure, sourceFile);
        }

        /**
         * Adds type parameters.
         * @param structures - Structures of the type parameters.
         * @param sourceFile - Optional source file to help with performance.
         */
        addTypeParameters(structures: TypeParameterStructure[], sourceFile: SourceFile = this.getRequiredSourceFile()) {
            return this.insertTypeParameters(getEndIndexFromArray(this.node.typeParameters), structures, sourceFile);
        }

        /**
         * Inserts a type parameter.
         * @param index - Index to insert at. Specify a negative index to insert from the reverse.
         * @param structure - Structure of the type parameter.
         * @param sourceFile - Optional source file to help with performance.
         */
        insertTypeParameter(index: number, structure: TypeParameterStructure, sourceFile: SourceFile = this.getRequiredSourceFile()) {
            this.insertTypeParameters(index, [structure], sourceFile);
            return this.getTypeParameters()[index];
        }

        /**
         * Inserts type parameters.
         * @param index - Index to insert at. Specify a negative index to insert from the reverse.
         * @param structures - Structures of the type parameters.
         * @param sourceFile - Optional source file to help with performance.
         */
        insertTypeParameters(index: number, structures: TypeParameterStructure[], sourceFile: SourceFile = this.getRequiredSourceFile()) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const typeParameters = this.getTypeParameters();
            const code = getStructuresCode(structures);
            index = verifyAndGetIndex(index, typeParameters.length);

            if (typeParameters.length === 0) {
                const insertPos = getNamedNode(this).getNameNode().getEnd();
                sourceFile.insertText(insertPos, `<${code}>`);
            }
            else {
                insertIntoCommaSeparatedNodes(sourceFile, typeParameters, index, code);
            }

            return this.getTypeParameters().splice(index, index + structures.length);
        }
    };
}

function getStructuresCode(structures: TypeParameterStructure[]) {
    return structures.map(s => getStructureCode(s)).join(", ");
}

function getStructureCode(structure: TypeParameterStructure) {
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
