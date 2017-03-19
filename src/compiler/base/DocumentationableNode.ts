import * as ts from "typescript";
import {Node} from "./../common";
import {JSDoc} from "./../doc/JSDoc";

export type DocumentationableNodeExtensionType = Node<any>;

export interface DocumentationableNode extends DocumentationableNodeExtensionType {
    getDocumentationComment(): string | undefined;
    getDocumentationCommentNodes(): Node<ts.JSDoc>[];
}

export function DocumentationableNode<T extends Constructor<DocumentationableNodeExtensionType>>(Base: T): Constructor<DocumentationableNode> & T {
    return class extends Base implements DocumentationableNode {
        /**
         * Gets the documentation comment text or undefined if none exists.
         * This will return multiple documentation comments separated by newlines.
         */
        getDocumentationComment() {
            const docCommentNodes = this.getDocumentationCommentNodes();
            if (docCommentNodes.length === 0)
                return undefined;

            const texts = docCommentNodes.map(n => (n.getCompilerNode().comment || "").trim());
            return texts.join(this.factory.getLanguageService().getNewLine());
        }

        /**
         * Gets the documentation comment nodes or undefined if none exists.
         */
        getDocumentationCommentNodes(): JSDoc[] {
            const nodes = (this.node as any).jsDoc as ts.JSDoc[] || [];
            return nodes.map(n => this.factory.getJSDoc(n));
        }
    };
}
