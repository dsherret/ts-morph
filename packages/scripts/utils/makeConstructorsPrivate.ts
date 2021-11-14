import { tsMorph } from "../deps.ts";

export function makeConstructorsPrivate(mainFile: tsMorph.SourceFile) {
  forEachDescendant(mainFile);

  function forEachDescendant(node: tsMorph.Node) {
    node.forEachChild(forEachDescendant);

    if (tsMorph.Node.isClassDeclaration(node))
      withClass(node);

    if (!tsMorph.Node.isSourceFile(node))
      node.forget();

    function withClass(classDec: tsMorph.ClassDeclaration) {
      for (const ctor of classDec.getConstructors()) {
        const hasPrivateTag = ctor.getJsDocs().some(doc => doc.getTags().some(tag => tag.getTagName() === "private"));
        if (hasPrivateTag) {
          ctor.getParameters().forEach(p => p.remove());
          ctor.getJsDocs().forEach(d => d.remove());
          ctor.setScope(classDec.getDerivedClasses().length > 0 ? tsMorph.Scope.Protected : tsMorph.Scope.Private);
        }
      }
    }
  }
}
