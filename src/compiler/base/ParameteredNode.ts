import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {insertIntoCommaSeparatedNodes, insertIntoSyntaxList, verifyAndGetIndex, getEndIndexFromArray} from "./../../manipulation";
import * as fillClassFuncs from "./../../manipulation/fillClassFunctions";
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
            return this.compilerNode.parameters.map(p => this.global.compilerFactory.getParameterDeclaration(p, this.sourceFile));
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
            index = verifyAndGetIndex(index, parameters.length);

            if (parameters.length === 0) {
                const syntaxList = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenParenToken).getNextSibling();
                if (syntaxList == null || syntaxList.getKind() !== ts.SyntaxKind.SyntaxList)
                    throw new errors.NotImplementedError("Expected to find a syntax list after the open parens");

                insertIntoSyntaxList({
                    insertPos: syntaxList.getPos(),
                    newText: parameterCodes.join(", "),
                    syntaxList,
                    childIndex: 0,
                    insertItemsCount: structures.length * 2 - 1
                });
            }
            else {
                insertIntoCommaSeparatedNodes({ currentNodes: parameters, insertIndex: index, newTexts: parameterCodes });
            }

            const newParameters = this.getParameters().slice(index, index + structures.length);
            newParameters.forEach((p, i) => fillClassFuncs.fillParameterDeclarationFromStructure(p, structures[i]));
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
