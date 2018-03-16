import {ts, SyntaxKind} from "./../../typescript";
import {Constructor} from "./../../Constructor";
import * as errors from "./../../errors";
import {insertIntoCommaSeparatedNodes, verifyAndGetIndex, getEndIndexFromArray, getNodesToReturn} from "./../../manipulation";
import {ParameterDeclarationStructure, ParameteredNodeStructure} from "./../../structures";
import {ParameterDeclarationStructureToText} from "./../../structureToTexts";
import {callBaseFill} from "./../callBaseFill";
import {ArrayUtils, getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction} from "./../../utils";
import {Node} from "./../common";
import {ParameterDeclaration} from "./../function/ParameterDeclaration";

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
        getParameter(nameOrFindFunction: string | ((declaration: ParameterDeclaration) => boolean)): ParameterDeclaration | undefined {
            return getNodeByNameOrFindFunction(this.getParameters(), nameOrFindFunction);
        }

        getParameterOrThrow(nameOrFindFunction: string | ((declaration: ParameterDeclaration) => boolean)): ParameterDeclaration {
            return errors.throwIfNullOrUndefined(this.getParameter(nameOrFindFunction), () => getNotFoundErrorMessageForNameOrFindFunction("parameter", nameOrFindFunction));
        }

        getParameters() {
            return this.compilerNode.parameters.map(p => this.getNodeFromCompilerNode<ParameterDeclaration>(p));
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

            const newTexts = structures.map(s => {
                // todo: pass the structure to text to the function below
                const writer = this.getWriter();
                const structureToText = new ParameterDeclarationStructureToText(writer);
                structureToText.writeText(s);
                return writer.toString();
            });

            insertIntoCommaSeparatedNodes({
                parent: syntaxList,
                currentNodes: parameters,
                insertIndex: index,
                newTexts
            });

            const newParameters = getNodesToReturn(this.getParameters(), index, structures.length);
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
