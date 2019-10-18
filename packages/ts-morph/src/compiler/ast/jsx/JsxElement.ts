import { errors, ts } from "@ts-morph/common";
import { insertIntoParentTextRange } from "../../../manipulation";
import { WriterFunction } from "../../../types";
import { JsxElementStructure, JsxElementSpecificStructure, StructureKind } from "../../../structures";
import { printTextFromStringOrWriter } from "../../../utils";
import { JsxChild } from "../aliases";
import { getBodyText, getBodyTextWithoutLeadingIndentation } from "../base/helpers";
import { callBaseGetStructure } from "../callBaseGetStructure";
import { callBaseSet } from "../callBaseSet";
import { PrimaryExpression } from "../expression";
import { JsxClosingElement } from "./JsxClosingElement";
import { JsxOpeningElement } from "./JsxOpeningElement";

export const JsxElementBase = PrimaryExpression;
export class JsxElement extends JsxElementBase<ts.JsxElement> {
    /**
     * Gets the children of the JSX element.
     */
    getJsxChildren(): JsxChild[] {
        return this.compilerNode.children.map(c => this._getNodeFromCompilerNode(c));
    }

    /**
     * Gets the opening element.
     */
    getOpeningElement(): JsxOpeningElement {
        return this._getNodeFromCompilerNode(this.compilerNode.openingElement);
    }

    /**
     * Gets the closing element.
     */
    getClosingElement(): JsxClosingElement {
        return this._getNodeFromCompilerNode(this.compilerNode.closingElement);
    }

    /**
     * Sets the body text.
     * @param textOrWriterFunction - Text or writer function to set as the body.
     */
    setBodyText(textOrWriterFunction: string | WriterFunction) {
        const newText = getBodyText(this._getWriterWithIndentation(), textOrWriterFunction);
        setText(this, newText);
        return this;
    }

    /**
     * Sets the body text without surrounding new lines.
     * @param textOrWriterFunction - Text to set as the body.
     */
    setBodyTextInline(textOrWriterFunction: string | WriterFunction) {
        const writer = this._getWriterWithQueuedChildIndentation();
        printTextFromStringOrWriter(writer, textOrWriterFunction);
        if (writer.isLastNewLine()) {
            writer.setIndentationLevel(Math.max(0, this.getIndentationLevel() - 1));
            writer.write(""); // indentation
        }
        setText(this, writer.toString());
        return this;
    }

    /**
     * Sets the node from a structure.
     * @param structure - Structure to set the node with.
     */
    set(structure: Partial<JsxElementStructure>) {
        callBaseSet(JsxElementBase.prototype, this, structure);

        if (structure.attributes != null) {
            const openingElement = this.getOpeningElement();
            openingElement.getAttributes().forEach(a => a.remove());
            openingElement.addAttributes(structure.attributes);
        }

        // todo: deprecate bodyText when implementing this
        if (structure.children != null)
            throw new errors.NotImplementedError("Setting JSX children is currently not implemented. Please open an issue if you need this.");

        if (structure.bodyText != null)
            this.setBodyText(structure.bodyText);
        else if (structure.hasOwnProperty(nameof(structure.bodyText)))
            this.setBodyTextInline("");

        if (structure.name != null) {
            this.getOpeningElement().getTagNameNode().replaceWithText(structure.name);
            this.getClosingElement().getTagNameNode().replaceWithText(structure.name);
        }

        return this;
    }

    /**
     * Gets the structure equivalent to this node.
     */
    getStructure(): JsxElementStructure {
        const openingElement = this.getOpeningElement();
        const structure = callBaseGetStructure<JsxElementSpecificStructure>(JsxElementBase.prototype, this, {
            kind: StructureKind.JsxElement,
            name: openingElement.getTagNameNode().getText(),
            attributes: openingElement.getAttributes().map(a => a.getStructure()),
            children: undefined,
            bodyText: getBodyTextWithoutLeadingIndentation(this)
        });
        delete structure.children;
        return structure;
    }
}

function setText(element: JsxElement, newText: string) {
    const openingElement = element.getOpeningElement();
    const closingElement = element.getClosingElement();

    insertIntoParentTextRange({
        insertPos: openingElement.getEnd(),
        newText,
        parent: element.getChildSyntaxListOrThrow(),
        replacing: {
            textLength: closingElement.getStart() - openingElement.getEnd()
        }
    });
}
