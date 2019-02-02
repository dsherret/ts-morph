import { Node, TypeGuards } from "ts-morph";

export function removeImportTypes(node: Node) {
    node.forEachChild(childNode => {
        removeImportTypes(childNode);

        if (TypeGuards.isImportTypeNode(childNode))
            childNode.replaceWithText(childNode.getText().replace(/import\([^\)]+\)\./, ""));

        childNode.forget();
    });
}
