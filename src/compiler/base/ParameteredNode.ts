import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertIntoCommaSeparatedNodes, insertIntoSyntaxList, verifyAndGetIndex, getEndIndexFromArray} from "./../../manipulation";
import {ParameterStructure} from "./../../structures";
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
    addParameter(structure: ParameterStructure): ParameterDeclaration;
    /**
     * Adds parameters.
     * @param structures - Structures of the parameters.
     */
    addParameters(structures: ParameterStructure[]): ParameterDeclaration[];
    /**
     * Inserts parameters.
     * @param index - Index to insert at.
     * @param structures - Parameters to insert.
     */
    insertParameters(index: number, structures: ParameterStructure[]): ParameterDeclaration[];
    /**
     * Inserts a parameter.
     * @param index - Index to insert at.
     * @param structures - Parameter to insert.
     */
    insertParameter(index: number, structure: ParameterStructure): ParameterDeclaration;
}

export function ParameteredNode<T extends Constructor<ParameteredNodeExtensionType>>(Base: T): Constructor<ParameteredNode> & T {
    return class extends Base implements ParameteredNode {
        getParameters() {
            return this.node.parameters.map(p => this.factory.getParameterDeclaration(p, this.sourceFile));
        }

        addParameter(structure: ParameterStructure) {
            return this.addParameters([structure])[0];
        }

        addParameters(structures: ParameterStructure[]) {
            return this.insertParameters(getEndIndexFromArray(this.node.parameters), structures);
        }

        insertParameter(index: number, structure: ParameterStructure) {
            return this.insertParameters(index, [structure])[0];
        }

        insertParameters(index: number, structures: ParameterStructure[]) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const parameters = this.getParameters();
            const parameterCodes = structures.map(s => getStructureCode(s));
            index = verifyAndGetIndex(index, parameters.length);

            if (parameters.length === 0) {
                const syntaxList = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenParenToken).getNextSibling();
                if (syntaxList == null || syntaxList.getKind() !== ts.SyntaxKind.SyntaxList)
                    throw new errors.NotImplementedError("Expected to find a syntax list after the open parens");

                insertIntoSyntaxList(this.getSourceFile(), syntaxList.getPos(), parameterCodes.join(", "), syntaxList, 0, structures.length * 2 - 1);
            }
            else {
                insertIntoCommaSeparatedNodes(this.getSourceFile(), parameters, index, parameterCodes);
            }

            return this.getParameters().slice(index, index + structures.length);
        }
    };
}

function getStructureCode(structure: ParameterStructure) {
    let code = "";
    if (structure.isRestParameter)
        code += "...";
    code += structure.name;
    if (structure.type != null && structure.type.length > 0)
        code += `: ${structure.type}`;
    return code;
}
