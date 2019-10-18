import { SourceFile, Node, TypeGuards, ClassDeclaration, Scope } from "ts-morph";

export function makeConstructorsPrivate(mainFile: SourceFile) {
    forEachDescendant(mainFile);

    function forEachDescendant(node: Node) {
        node.forEachChild(forEachDescendant);

        if (TypeGuards.isClassDeclaration(node))
            withClass(node);

        if (!TypeGuards.isSourceFile(node))
            node.forget();

        function withClass(classDec: ClassDeclaration) {
            for (const ctor of classDec.getConstructors()) {
                const hasPrivateTag = ctor.getJsDocs().some(doc => doc.getTags().some(tag => tag.getTagName() === "private"));
                if (hasPrivateTag) {
                    ctor.getParameters().forEach(p => p.remove());
                    ctor.getJsDocs().forEach(d => d.remove());
                    ctor.setScope(classDec.getDerivedClasses().length > 0 ? Scope.Protected : Scope.Private);
                }
            }
        }
    }
}
