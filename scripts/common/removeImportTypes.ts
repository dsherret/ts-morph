import { Node, TypeGuards } from "ts-simple-ast";

export function removeImportTypes(node: Node) {
    node.forEachChild(childNode => {
        removeImportTypes(childNode);

        if (!TypeGuards.isImportTypeNode(childNode))
            return;

        childNode.replaceWithText(childNode.getText().replace(/import\([^\)]+\)\./, ""));
        childNode.forget();
    });
}
