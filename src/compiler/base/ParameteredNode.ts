import * as ts from "typescript";
import * as errors from "./../../errors";
import {insertIntoCommaSeparatedNodes, insertIntoSyntaxList, verifyAndGetIndex, getEndIndexFromArray} from "./../../manipulation";
import {ParameterStructure} from "./../../structures";
import {ArrayUtils} from "./../../utils";
import {Node} from "./../common";
import {SourceFile} from "./../file";
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
     * @param sourceFile - Optional source file to help with performance.
     */
    addParameter(structure: ParameterStructure, sourceFile?: SourceFile): ParameterDeclaration;
    /**
     * Adds parameters.
     * @param structures - Structures of the parameters.
     * @param sourceFile - Optional source file to help with performance.
     */
    addParameters(structures: ParameterStructure[], sourceFile?: SourceFile): ParameterDeclaration[];
    /**
     * Inserts parameters.
     * @param index - Index to insert at.
     * @param structures - Parameters to insert.
     * @param sourceFile - Optional source file to help improve performance.
     */
    insertParameters(index: number, structures: ParameterStructure[], sourceFile?: SourceFile): ParameterDeclaration[];
    /**
     * Inserts a parameter.
     * @param index - Index to insert at.
     * @param structures - Parameter to insert.
     * @param sourceFile - Optional source file to help improve performance.
     */
    insertParameter(index: number, structure: ParameterStructure, sourceFile?: SourceFile): ParameterDeclaration;
}

export function ParameteredNode<T extends Constructor<ParameteredNodeExtensionType>>(Base: T): Constructor<ParameteredNode> & T {
    return class extends Base implements ParameteredNode {
        getParameters() {
            return this.node.parameters.map(p => this.factory.getParameterDeclaration(p));
        }

        addParameter(structure: ParameterStructure, sourceFile = this.getSourceFileOrThrow()) {
            return this.addParameters([structure], sourceFile)[0];
        }

        addParameters(structures: ParameterStructure[], sourceFile = this.getSourceFileOrThrow()) {
            return this.insertParameters(getEndIndexFromArray(this.node.parameters), structures, sourceFile);
        }

        insertParameter(index: number, structure: ParameterStructure, sourceFile = this.getSourceFileOrThrow()) {
            return this.insertParameters(index, [structure], sourceFile)[0];
        }

        insertParameters(index: number, structures: ParameterStructure[], sourceFile = this.getSourceFileOrThrow()) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const parameters = this.getParameters();
            const parameterCodes = structures.map(s => getStructureCode(s));
            index = verifyAndGetIndex(index, parameters.length);

            if (parameters.length === 0) {
                const syntaxList = this.getFirstChildByKindOrThrow(ts.SyntaxKind.OpenParenToken).getNextSibling();
                if (syntaxList == null || syntaxList.getKind() !== ts.SyntaxKind.SyntaxList)
                    throw new errors.NotImplementedError("Expected to find a syntax list after the open parens");

                insertIntoSyntaxList(sourceFile, syntaxList.getPos(), parameterCodes.join(", "), syntaxList, 0, structures.length * 2 - 1);
            }
            else {
                insertIntoCommaSeparatedNodes(sourceFile, parameters, index, parameterCodes);
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
