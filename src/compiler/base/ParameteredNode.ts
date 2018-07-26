import * as errors from "../../errors";
import { getEndIndexFromArray, getNodesToReturn, insertIntoCommaSeparatedNodes, verifyAndGetIndex } from "../../manipulation";
import { ParameterDeclarationStructure, ParameteredNodeStructure } from "../../structures";
import { Constructor } from "../../types";
import { SyntaxKind, ts } from "../../typescript";
import { ArrayUtils, getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction } from "../../utils";
import { callBaseFill } from "../callBaseFill";
import { Node } from "../common";
import { ParameterDeclaration } from "../function/ParameterDeclaration";

export type ParameteredNodeExtensionType = Node<ts.Node & { parameters: ts.NodeArray<ts.ParameterDeclaration>; }>;

export interface ParameteredNode {
    /**
     * Gets a parameter or undefined if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getParameter(name: string): ParameterDeclaration | undefined;
    /**
     * Gets a parameter or undefined if it doesn't exist.
     * @param findFunction - Function to use to find the parameter.
     */
    getParameter(findFunction: (declaration: ParameterDeclaration) => boolean): ParameterDeclaration | undefined;
    /**
     * Gets a parameter or throws if it doesn't exist.
     * @param name - Name of the parameter.
     */
    getParameterOrThrow(name: string): ParameterDeclaration;
    /**
     * Gets a parameter or throws if it doesn't exist.
     * @param findFunction - Function to use to find the parameter.
     */
    getParameterOrThrow(findFunction: (declaration: ParameterDeclaration) => boolean): ParameterDeclaration;
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
     * @param index - Child index to insert at.
     * @param structures - Parameters to insert.
     */
    insertParameters(index: number, structures: ParameterDeclarationStructure[]): ParameterDeclaration[];
    /**
     * Inserts a parameter.
     * @param index - Child index to insert at.
     * @param structures - Parameter to insert.
     */
    insertParameter(index: number, structure: ParameterDeclarationStructure): ParameterDeclaration;
}

export function ParameteredNode<T extends Constructor<ParameteredNodeExtensionType>>(Base: T): Constructor<ParameteredNode> & T {
    return class extends Base implements ParameteredNode {
        getParameter(nameOrFindFunction: string | ((declaration: ParameterDeclaration) => boolean)): ParameterDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getParameters(), nameOrFindFunction);
        }

        getParameterOrThrow(nameOrFindFunction: string | ((declaration: ParameterDeclaration) => boolean)): ParameterDeclaration {
            return errors.throwIfNullOrUndefined(this.getParameter(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("parameter", nameOrFindFunction));
        }

        getParameters() {
            return this.compilerNode.parameters.map(p => this.getNodeFromCompilerNode(p));
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
            const syntaxList = this.getFirstChildByKindOrThrow(SyntaxKind.OpenParenToken).getNextSiblingIfKindOrThrow(SyntaxKind.SyntaxList);
            index = verifyAndGetIndex(index, parameters.length);

            const writer = this.getWriterWithQueuedChildIndentation();
            const structurePrinter = this.context.structurePrinterFactory.forParameterDeclaration();

            structurePrinter.printTexts(writer, structures);

            insertIntoCommaSeparatedNodes({
                parent: syntaxList,
                currentNodes: parameters,
                insertIndex: index,
                newText: writer.toString()
            });

            return getNodesToReturn(this.getParameters(), index, structures.length);
        }

        fill(structure: Partial<ParameteredNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.parameters != null && structure.parameters.length > 0)
                this.addParameters(structure.parameters);

            return this;
        }
    };
}
