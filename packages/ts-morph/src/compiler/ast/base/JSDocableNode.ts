import { ArrayUtils, ts } from "@ts-morph/common";
import { getEndIndexFromArray, getNodesToReturn, insertIntoParentTextRange, verifyAndGetIndex } from "../../../manipulation";
import { JSDocableNodeStructure, JSDocStructure, OptionalKind } from "../../../structures";
import { Constructor } from "../../../types";
import { callBaseSet } from "../callBaseSet";
import { WriterFunction } from "../../../types";
import { Node } from "../common";
import { JSDoc } from "../doc/JSDoc";
import { callBaseGetStructure } from "../callBaseGetStructure";

export type JSDocableNodeExtensionType = Node<ts.Node & { jsDoc?: ts.NodeArray<ts.JSDoc>; }>;

export interface JSDocableNode {
    /**
     * Gets the JS doc nodes.
     */
    getJsDocs(): JSDoc[];
    /**
     * Adds a JS doc.
     * @param structure - Structure to add.
     */
    addJsDoc(structure: OptionalKind<JSDocStructure> | string | WriterFunction): JSDoc;
    /**
     * Adds JS docs.
     * @param structures - Structures to add.
     */
    addJsDocs(structures: ReadonlyArray<OptionalKind<JSDocStructure> | string | WriterFunction>): JSDoc[];
    /**
     * Inserts a JS doc.
     * @param index - Child index to insert at.
     * @param structure - Structure to insert.
     */
    insertJsDoc(index: number, structure: OptionalKind<JSDocStructure> | string | WriterFunction): JSDoc;
    /**
     * Inserts JS docs.
     * @param index - Child index to insert at.
     * @param structures - Structures to insert.
     */
    insertJsDocs(index: number, structures: ReadonlyArray<OptionalKind<JSDocStructure> | string | WriterFunction>): JSDoc[];
}

export function JSDocableNode<T extends Constructor<JSDocableNodeExtensionType>>(Base: T): Constructor<JSDocableNode> & T {
    return class extends Base implements JSDocableNode {
        getJsDocs(): JSDoc[] {
            const nodes = this.compilerNode.jsDoc;
            return nodes?.map(n => this._getNodeFromCompilerNode(n)) ?? [];
        }

        addJsDoc(structure: OptionalKind<JSDocStructure> | string | WriterFunction) {
            return this.addJsDocs([structure])[0];
        }

        addJsDocs(structures: ReadonlyArray<OptionalKind<JSDocStructure> | string | WriterFunction>) {
            return this.insertJsDocs(getEndIndexFromArray(this.compilerNode.jsDoc), structures);
        }

        insertJsDoc(index: number, structure: OptionalKind<JSDocStructure> | string | WriterFunction) {
            return this.insertJsDocs(index, [structure])[0];
        }

        insertJsDocs(index: number, structures: ReadonlyArray<OptionalKind<JSDocStructure> | string | WriterFunction>) {
            if (ArrayUtils.isNullOrEmpty(structures))
                return [];

            const writer = this._getWriterWithQueuedIndentation();
            const structurePrinter = this._context.structurePrinterFactory.forJSDoc();
            structurePrinter.printDocs(writer, structures);
            writer.write(""); // final indentation
            const code = writer.toString();
            const nodes = this.getJsDocs();
            index = verifyAndGetIndex(index, nodes.length);

            const insertPos = index === nodes.length ? this.getStart() : nodes[index].getStart();
            insertIntoParentTextRange({
                insertPos,
                parent: this,
                newText: code
            });

            return getNodesToReturn(nodes, this.getJsDocs(), index, false);
        }

        set(structure: Partial<JSDocableNodeStructure>) {
            callBaseSet(Base.prototype, this, structure);

            if (structure.docs != null) {
                this.getJsDocs().forEach(doc => doc.remove());
                this.addJsDocs(structure.docs);
            }

            return this;
        }

        getStructure() {
            return callBaseGetStructure<JSDocableNodeStructure>(Base.prototype, this, {
                docs: this.getJsDocs().map(jsdoc => jsdoc.getStructure())
            });
        }
    };
}
