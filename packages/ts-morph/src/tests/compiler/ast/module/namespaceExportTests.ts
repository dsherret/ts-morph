import { nameof, SyntaxKind } from "@ts-morph/common";
import { expect } from "chai";
import { NamespaceExport } from "../../../../compiler";
import { getInfoFromTextWithDescendant } from "../../testHelpers";

describe("NamespaceExport", () => {
  function getNamespaceExport(text: string) {
    return getInfoFromTextWithDescendant<NamespaceExport>(text, SyntaxKind.NamespaceExport, { filePath: "main.ts" });
  }

  describe(nameof<NamespaceExport>("setName"), () => {
    it("should only change what's imported", () => {
      const { descendant, sourceFile, project } = getNamespaceExport("export * as ts from './file';");
      const otherSourceFile = project.createSourceFile("file.ts", "export class name {}\nexport class newName {}");
      const importSourceFile = project.createSourceFile("file2.ts", "import { ts } from './main'; const t = ts;");
      descendant.setName("tsNew");
      expect(sourceFile.getText()).to.equal("export * as tsNew from './file';");
      expect(otherSourceFile.getText()).to.equal("export class name {}\nexport class newName {}");
      expect(importSourceFile.getText()).to.equal("import { ts } from './main'; const t = ts;");
    });
  });

  describe(nameof<NamespaceExport>("rename"), () => {
    // Doesn't work. Opened https://github.com/microsoft/TypeScript/issues/36836
    it.skip("should rename what's imported", () => {
      const { descendant, sourceFile, project } = getNamespaceExport("export * as ts from './file';");
      const otherSourceFile = project.createSourceFile("file.ts", "export class name {}\nexport class newName {}");
      const importSourceFile = project.createSourceFile("file2.ts", "import { ts } from './main'; const t = ts;");
      descendant.rename("tsNew");
      expect(sourceFile.getText()).to.equal("export * as tsNew from './file';");
      expect(otherSourceFile.getText()).to.equal("export class name {}\nexport class newName {}");
      expect(importSourceFile.getText()).to.equal("import { tsNew } from './main'; const t = tsNew;");
    });
  });

  describe(nameof<NamespaceExport>("getNameNode"), () => {
    function doTest(text: string, name: string) {
      const { descendant } = getNamespaceExport(text);
      expect(descendant.getNameNode().getText()).to.equal(name);
    }

    it("should get the name", () => {
      doTest(`export * as name from "./test";`, "name");
    });
  });

  describe(nameof<NamespaceExport>("getName"), () => {
    function doTest(text: string, name: string) {
      const { descendant } = getNamespaceExport(text);
      expect(descendant.getName()).to.equal(name);
    }

    it("should get the name", () => {
      doTest(`export * as name from "./test";`, "name");
    });
  });
});
