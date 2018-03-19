import {ts} from "../../../typescript";
import {ExpressionedNode} from "../../expression";
import {Node} from "../../common";
import {TemplateMiddle} from "./TemplateMiddle";
import {TemplateTail} from "./TemplateTail";

export const TemplateSpanBase = ExpressionedNode(Node);
export class TemplateSpan extends TemplateSpanBase<ts.TemplateSpan> {
    /**
     * Gets the template literal.
     */
    getLiteral() {
        return this.getNodeFromCompilerNode<TemplateMiddle | TemplateTail>(this.compilerNode.literal);
    }
}
