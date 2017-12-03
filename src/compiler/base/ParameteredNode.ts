import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {insertIntoCommaSeparatedNodes, insertIntoParent, verifyAndGetIndex, getEndIndexFromArray} from "./../../manipulation";
import {ParameterDeclarationStructure, ParameteredNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {ArrayUtils} from "./../../utils";
import {Node} from "./../common";
import {ParameterDeclaration} from "./../function/ParameterDeclaration";

export type ParameteredNodeExtensionType = Node<ts.Node & { parameters: ts.NodeArray<ts.ParameterDeclaration>; }>;

export interface ParameteredNode {
    /**
     * Gets all the parameters of the node.
     */
    getParameters(): ParameterDeclaration[];
    /**
     * Adds a parameter.
     * @param structure - Structure of the parameter.
     */
    addParameter(structure: ParameterDeclarationStructure): ParameterDeclaration;
    /**
     * Adds parameters.
     * @param structures - Structures of the parameters.
     */
    addParameters(structures: ParameterDeclarationStructure[]): ParameterDeclaration[];
    /**
     * Inserts parameters.
     * @param index - Index to insert at.
     * @param structures - Parameters to insert.
     */
    insertParameters(index: number, structures: ParameterDeclarationStructure[]): ParameterDeclaration[];
    /**
     * Inserts a parameter.
     * @param index - Index to insert at.
     * @param structures - Parameter to insert.
     */
    insertParameter(index: number, structure: ParameterDeclarationStructure): ParameterDeclaration;
}

export function ParameteredNode<T extends Constructor<ParameteredNodeExtensionType>>(Base: T): Constructor<ParameteredNode> & T {
    return class extends Base implements ParameteredNode {
        getParameters() {
            return this.compilerNode.parameters.map(p => this.global.compilerFactory.getNodeFromCompilerNode(p, this.sourceFile) as ParameterDeclaration);
        }

        addParameter(structure: ParameterDeclarationStructure) {
            return this.addParameters([structure])[0];
        }

        addParameters(structures: ParameterDeclarationStructure[]) {
            return this.insertParameters(getEndIndexFromArray(this.compilerNode.parameters), structures);
        }

        insertParameter(index: number, structure: ParameterDeclarationStructure) {
            return this.insertParameters(index, [structure])[0];
        }

        insertParameters(index: number, structures: ParameterDeclarationStructure[]) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const parameters = this.getParameters();
            const parameterCodes = structures.map(s => getStructureCode(s));
            const syntaxList = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenParenToken).getNextSiblingIfKindOrThrow(ts.SyntaxKind.SyntaxList);
            index = verifyAndGetIndex(index, parameters.length);

            insertIntoCommaSeparatedNodes({
                parent: syntaxList,
                currentNodes: parameters,
                insertIndex: index,
                newTexts: parameterCodes
            });

            const newParameters = this.getParameters().slice(index, index + structures.length);
            newParameters.forEach((p, i) => p.fill(structures[i]));
            return newParameters;
        }

        fill(structure: Partial<ParameteredNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.parameters != null && structure.parameters.length > 0)
                this.addParameters(structure.parameters);

            return this;
        }
    };
}

function getStructureCode(structure: ParameterDeclarationStructure) {
    let code = "";
    if (structure.isRestParameter)
        code += "...";
    code += structure.name;
    if (structure.type != null && structure.type.length > 0)
        code += `: ${structure.type}`;
    return code;
}
