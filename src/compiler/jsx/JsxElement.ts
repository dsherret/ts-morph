import { insertIntoParentTextRange } from "../../manipulation";
import { WriterFunction } from "../../types";
import { ts } from "../../typescript";
import { printTextFromStringOrWriter } from "../../utils";
import { JsxChild } from "../aliases";
import { getBodyText } from "../base/helpers";
import { PrimaryExpression } from "../expression";
import { JsxClosingElement } from "./JsxClosingElement";
import { JsxOpeningElement } from "./JsxOpeningElement";

export class JsxElement extends PrimaryExpression<ts.JsxElement> {
    /**
     * Gets the children of the JSX element.
     */
    getJsxChildren(): JsxChild[] {
        return this.compilerNode.children.map(c => this.getNodeFromCompilerNode(c));
    }

    /**
     * Gets the opening element.
     */
    getOpeningElement(): JsxOpeningElement {
        return this.getNodeFromCompilerNode(this.compilerNode.openingElement);
    }

    /**
     * Gets the closing element.
     */
    getClosingElement(): JsxClosingElement {
        return this.getNodeFromCompilerNode(this.compilerNode.closingElement);
    }

    /**
     * Sets the body text.
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyText(writerFunction: WriterFunction): this;
    /**
     * Sets the body text.
     * @param text - Text to set as the body.
     */
    setBodyText(text: string): this;
    setBodyText(textOrWriterFunction: string | WriterFunction) {
        const newText = getBodyText(this.getWriterWithIndentation(), textOrWriterFunction);
        setText(this, newText);
        return this;
    }

    /**
     * Sets the body text without surrounding new lines.
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyTextInline(writerFunction: WriterFunction): this;
    /**
     * Sets the body text without surrounding new lines.
     * @param text - Text to set as the body.
     */
    setBodyTextInline(text: string): this;
    setBodyTextInline(textOrWriterFunction: string | WriterFunction) {
        const writer = this.getWriterWithQueuedChildIndentation();
        printTextFromStringOrWriter(writer, textOrWriterFunction);
        if (writer.isLastNewLine()) {
            writer.setIndentationLevel(Math.max(0, this.getIndentationLevel() - 1));
            writer.write(""); // indentation
        }
        setText(this, writer.toString());
        return this;
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
