import { errors, SyntaxKind, ts } from "@ts-morph/common";
import { getNodesToReturn, insertIntoParentTextRange, verifyAndGetIndex } from "../../../../manipulation";
import { SpaceFormattingStructuresPrinter } from "../../../../structurePrinters";
import { JsxAttributeStructure, JsxSpreadAttributeStructure, OptionalKind } from "../../../../structures";
import { Constructor } from "../../../../types";
import { getNodeByNameOrFindFunction, getNotFoundErrorMessageForNameOrFindFunction } from "../../../../utils";
import { JsxAttributedNodeStructure } from "../../../../structures";
import { callBaseSet } from "../../callBaseSet";
import { callBaseGetStructure } from "../../callBaseGetStructure";
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
    addAttribute(attribute: OptionalKind<JsxAttributeStructure> | OptionalKind<JsxSpreadAttributeStructure>): JsxAttributeLike;
    /**
     * Adds attributes into the element.
     */
    addAttributes(attributes: ReadonlyArray<OptionalKind<JsxAttributeStructure> | OptionalKind<JsxSpreadAttributeStructure>>): JsxAttributeLike[];
    /**
     * Inserts an attribute into the element.
     */
    insertAttribute(index: number, attribute: OptionalKind<JsxAttributeStructure> | OptionalKind<JsxSpreadAttributeStructure>): JsxAttributeLike;
    /**
     * Inserts attributes into the element.
     */
    insertAttributes(
        index: number,
        attributes: ReadonlyArray<OptionalKind<JsxAttributeStructure> | OptionalKind<JsxSpreadAttributeStructure>>
    ): JsxAttributeLike[];
}

export function JsxAttributedNode<T extends Constructor<JsxAttributedNodeExtensionType>>(Base: T): Constructor<JsxAttributedNode> & T {
    return class extends Base implements JsxAttributedNode {
        getAttributes() {
            return this.compilerNode.attributes.properties.map(p => this._getNodeFromCompilerNode(p));
        }

        getAttributeOrThrow(nameOrFindFunction: (string | ((attribute: JsxAttributeLike) => boolean))) {
            return errors.throwIfNullOrUndefined(this.getAttribute(nameOrFindFunction),
                () => getNotFoundErrorMessageForNameOrFindFunction("attribute", nameOrFindFunction));
        }

        getAttribute(nameOrFindFunction: (string | ((attribute: JsxAttributeLike) => boolean))) {
            return getNodeByNameOrFindFunction(this.getAttributes(), nameOrFindFunction);
        }

        addAttribute(structure: OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure) {
            return this.addAttributes([structure])[0];
        }

        addAttributes(structures: ReadonlyArray<OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure>) {
            return this.insertAttributes(this.compilerNode.attributes.properties.length, structures);
        }

        insertAttribute(index: number, structure: OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure) {
            return this.insertAttributes(index, [structure])[0];
        }

        insertAttributes(index: number, structures: ReadonlyArray<OptionalKind<JsxAttributeStructure> | JsxSpreadAttributeStructure>) {
            if (structures.length === 0)
                return [];

            const originalChildrenCount = this.compilerNode.attributes.properties.length;
            index = verifyAndGetIndex(index, originalChildrenCount);

            const insertPos = index === 0 ? this.getTagNameNode().getEnd() : this.getAttributes()[index - 1].getEnd();
            const writer = this._getWriterWithQueuedChildIndentation();
            const structuresPrinter = new SpaceFormattingStructuresPrinter(this._context.structurePrinterFactory.forJsxAttributeDecider());
            structuresPrinter.printText(writer, structures);

            insertIntoParentTextRange({
                insertPos,
                newText: " " + writer.toString(),
                parent: this.getNodeProperty("attributes").getFirstChildByKindOrThrow(SyntaxKind.SyntaxList)
            });

            return getNodesToReturn(originalChildrenCount, this.getAttributes(), index, false);
        }

        set(structure: Partial<JsxAttributedNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.attributes != null) {
                this.getAttributes().forEach(a => a.remove());
                this.addAttributes(structure.attributes);
            }

            return this;
        }

        getStructure(): JsxAttributedNodeStructure {
            return callBaseGetStructure<JsxAttributedNodeStructure>(Base.prototype, this, {
                attributes: this.getAttributes().map(a => a.getStructure())
            });
        }
    };
}
