import CodeBlockWriter from "code-block-writer";
import { ts } from "../../typescript";
import { insertIntoParentTextRange } from "../../manipulation";
import { getTextFromStringOrWriter, printTextFromStringOrWriter } from "../../utils";
import { getBodyText } from "../base/helpers";
import { PrimaryExpression } from "../expression";
import { JsxChild } from "../aliases";
import { JsxOpeningElement } from "./JsxOpeningElement";
import { JsxClosingElement } from "./JsxClosingElement";

export class JsxElement extends PrimaryExpression<ts.JsxElement> {
    /**
     * Gets the children of the JSX element.
     */
    getJsxChildren(): JsxChild[] {
        return this.compilerNode.children.map(c => this.getNodeFromCompilerNode<JsxChild>(c));
    }

    /**
     * Gets the opening element.
     */
    getOpeningElement() {
        return this.getNodeFromCompilerNode<JsxOpeningElement>(this.compilerNode.openingElement);
    }

    /**
     * Gets the closing element.
     */
    getClosingElement() {
        return this.getNodeFromCompilerNode<JsxClosingElement>(this.compilerNode.closingElement);
    }

    /**
     * Sets the body text.
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyText(writerFunction: (writer: CodeBlockWriter) => void): this;
    /**
     * Sets the body text.
     * @param text - Text to set as the body.
     */
    setBodyText(text: string): this;
    setBodyText(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
        const newText = getBodyText(this.getWriterWithIndentation(), textOrWriterFunction);
        setText(this, newText);
        return this;
    }

    /**
     * Sets the body text without surrounding new lines.
     * @param writerFunction - Write the text using the provided writer.
     */
    setBodyTextInline(writerFunction: (writer: CodeBlockWriter) => void): this;
    /**
     * Sets the body text without surrounding new lines.
     * @param text - Text to set as the body.
     */
    setBodyTextInline(text: string): this;
    setBodyTextInline(textOrWriterFunction: string | ((writer: CodeBlockWriter) => void)) {
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
