import * as ts from "typescript";
import {Constructor} from "./../../Constructor";
import {insertIntoParent, verifyAndGetIndex, getEndIndexFromArray} from "./../../manipulation";
import {JSDocStructure, JSDocableNodeStructure} from "./../../structures";
import {callBaseFill} from "./../callBaseFill";
import {ArrayUtils} from "./../../utils";
import {Node} from "./../common";
import {JSDoc} from "./../doc/JSDoc";

export type JSDocableNodeExtensionType = Node<any>;

export interface JSDocableNode {
    /**
     * Gets the JS doc nodes.
     */
    getJsDocs(): JSDoc[];
    /**
     * Adds a JS doc.
     * @param structure - Structure to add.
     */
    addJsDoc(structure: JSDocStructure): JSDoc;
    /**
     * Adds JS docs.
     * @param structures - Structures to add.
     */
    addJsDocs(structures: JSDocStructure[]): JSDoc[];
    /**
     * Inserts a JS doc.
     * @param index - Index to insert at.
     * @param structure - Structure to insert.
     */
    insertJsDoc(index: number, structure: JSDocStructure): JSDoc;
    /**
     * Inserts JS docs.
     * @param index - Index to insert at.
     * @param structures - Structures to insert.
     */
    insertJsDocs(index: number, structures: JSDocStructure[]): JSDoc[];
}

export function JSDocableNode<T extends Constructor<JSDocableNodeExtensionType>>(Base: T): Constructor<JSDocableNode> & T {
    return class extends Base implements JSDocableNode {
        getJsDocs(): JSDoc[] {
            const nodes = (this.compilerNode as any).jsDoc as ts.JSDoc[] || [];
            return nodes.map(n => this.global.compilerFactory.getNodeFromCompilerNode(n, this.sourceFile) as JSDoc);
        }

        addJsDoc(structure: JSDocStructure) {
            return this.addJsDocs([structure])[0];
        }

        addJsDocs(structures: JSDocStructure[]) {
            return this.insertJsDocs(getEndIndexFromArray((this.compilerNode as any).jsDoc), structures);
        }

        insertJsDoc(index: number, structure: JSDocStructure) {
            return this.insertJsDocs(index, [structure])[0];
        }

        insertJsDocs(index: number, structures: JSDocStructure[]) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const indentationText = this.getIndentationText();
            const newLineText = this.global.manipulationSettings.getNewLineKind();
            const code = `${getDocumentationCode(structures, indentationText, newLineText)}${newLineText}${indentationText}`;
            const nodes = this.getJsDocs();
            index = verifyAndGetIndex(index, nodes.length);

            const insertPos = index === nodes.length ? this.getStart() : nodes[index].getStart();
            insertIntoParent({
                insertPos,
                parent: this,
                newText: code,
                childIndex: nodes.length > 0 ? nodes[0].getChildIndex() + index : 0,
                insertItemsCount: structures.length
            });

            return this.getJsDocs().slice(index, index + structures.length);
        }

        fill(structure: Partial<JSDocableNodeStructure>) {
            callBaseFill(Base.prototype, this, structure);

            if (structure.docs != null && structure.docs.length > 0)
                this.addJsDocs(structure.docs);

            return this;
        }
    };
}

function getDocumentationCode(structures: JSDocStructure[], indentationText: string, newLineText: string) {
    let code = "";
    for (const structure of structures) {
        if (code.length > 0)
            code += `${newLineText}${indentationText}`;
        code += getDocumentationCodeForStructure(structure, indentationText, newLineText);
    }
    return code;
}

function getDocumentationCodeForStructure(structure: JSDocStructure, indentationText: string, newLineText: string) {
    const lines = structure.description.split(/\r?\n/);
    return `/**${newLineText}` + lines.map(l => `${indentationText} * ${l}`).join(newLineText) + `${newLineText}${indentationText} */`;
}
