import * as errors from "../../../errors";
import { getNodesToReturn, insertIntoParentTextRange, verifyAndGetIndex } from "../../../manipulation";
import { SpaceFormattingStructuresPrinter } from "../../../structurePrinters";
import { JsxAttributeStructure } from "../../../structures";
import { Constructor } from "../../../types";
import { SyntaxKind, ts } from "../../../typescript";
import { getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction } from "../../../utils";
import { JsxAttributeLike } from "../../aliases";
import { Node } from "../../common";
import { JsxTagNamedNode } from "./JsxTagNamedNode";

export type JsxAttributedNodeExtensionType = Node<ts.Node & { attributes: ts.JsxAttributes; }> & JsxTagNamedNode;

export interface JsxAttributedNode {
    /**
     * Gets the JSX element's attributes.
     */
    getAttributes(): JsxAttributeLike[];
    /**
     * Gets an attribute by name or returns undefined when it can't be found.
     * @param name - Name to search for.
     */
    getAttribute(name: string): JsxAttributeLike | undefined;
    /**
     * Gets an attribute by a find function or returns undefined when it can't be found.
     * @param findFunction - Find function.
     */
    getAttribute(findFunction: (attribute: JsxAttributeLike) => boolean): JsxAttributeLike | undefined;
    /**
     * Gets an attribute by name or throws when it can't be found.
     * @param name - Name to search for.
     */
    getAttributeOrThrow(name: string): JsxAttributeLike;
    /**
     * Gets an attribute by a find function or throws when it can't be found.
     * @param findFunction - Find function.
     */
    getAttributeOrThrow(findFunction: (attribute: JsxAttributeLike) => boolean): JsxAttributeLike;
    /**
     * Adds an attribute into the element.
     */
    addAttribute(attribute: JsxAttributeStructure): JsxAttributeLike;
    /**
     * Adds attributes into the element.
     */
    addAttributes(attributes: JsxAttributeStructure[]): JsxAttributeLike[];
    /**
     * Inserts an attribute into the element.
     */
    insertAttribute(index: number, attribute: JsxAttributeStructure): JsxAttributeLike;
    /**
     * Inserts attributes into the element.
     */
    insertAttributes(index: number, attributes: JsxAttributeStructure[]): JsxAttributeLike[];
}

export function JsxAttributedNode<T extends Constructor<JsxAttributedNodeExtensionType>>(Base: T): Constructor<JsxAttributedNode> & T {
    return class extends Base implements JsxAttributedNode {
        getAttributes() {
            return this.compilerNode.attributes.properties.map(p => this.getNodeFromCompilerNode(p));
        }

        getAttributeOrThrow(nameOrFindFunction: (string | ((attribute: JsxAttributeLike) => boolean))) {
            return errors.throwIfNullOrUndefined(this.getAttribute(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("attribute", nameOrFindFunction));
        }

        getAttribute(nameOrFindFunction: (string | ((attribute: JsxAttributeLike) => boolean))) {
            return getNodeByNameOrFindFunction(this.getAttributes(), nameOrFindFunction);
        }

        addAttribute(structure: JsxAttributeStructure) {
            return this.addAttributes([structure])[0];
        }

        addAttributes(structures: JsxAttributeStructure[]) {
            return this.insertAttributes(this.compilerNode.attributes.properties.length, structures);
        }

        insertAttribute(index: number, structure: JsxAttributeStructure) {
            return this.insertAttributes(index, [structure])[0];
        }

        insertAttributes(index: number, structures: JsxAttributeStructure[]) {
            if (structures.length === 0)
                return [];

            index = verifyAndGetIndex(index, this.compilerNode.attributes.properties.length);

            const insertPos = index === 0 ? this.getTagName().getEnd() : this.getAttributes()[index - 1].getEnd();
            const writer = this.getWriterWithQueuedChildIndentation();
            const structuresPrinter = new SpaceFormattingStructuresPrinter(this.context.structurePrinterFactory.forJsxAttribute());
            structuresPrinter.printText(writer, structures);

            insertIntoParentTextRange({
                insertPos,
                newText: " " + writer.toString(),
                parent: this.getNodeProperty("attributes").getFirstChildByKindOrThrow(SyntaxKind.SyntaxList)
            });

            return getNodesToReturn(this.getAttributes(), index, structures.length);
        }
    };
}
