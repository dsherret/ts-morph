import { nameof, SyntaxKind, ts } from "@ts-morph/common";
import { expect } from "chai";
import { CallExpression, FunctionDeclaration, Identifier, InterfaceDeclaration, ModuleDeclaration, PropertyAccessExpression } from "../../../../compiler";
import { Project } from "../../../../Project";
import { getInfoFromText } from "../../testHelpers";

describe("Identifier", () => {
  describe(nameof<Identifier>("rename"), () => {
    it("should rename", () => {
      const text = "function myFunction() {} const reference = myFunction;";
      const { firstChild, sourceFile } = getInfoFromText<FunctionDeclaration>(text);
      firstChild.getNameNodeOrThrow().rename("newFunction");
      expect(sourceFile.getFullText()).to.equal(text.replace(/myFunction/g, "newFunction"));
    });

    it("should rename an identifier to a ThisKeyword", () => {
      const text = "const that = this; that.test;";
      const { sourceFile } = getInfoFromText(text);
      const thatIdentifier = sourceFile.getFirstDescendantOrThrow(d => d.getKind() === SyntaxKind.Identifier && d.getText() === "that") as Identifier;
      thatIdentifier.rename("this");
      expect(thatIdentifier.wasForgotten()).to.be.true;
      expect(sourceFile.getFullText()).to.equal("const this = this; this.test;");
    });
  });

  describe(nameof<Identifier>("getDefinitions"), () => {
    it("should get the definition", () => {
      const sourceFileText = "function myFunction() {}\nconst reference = myFunction;";
      const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>(sourceFileText);
      const secondSourceFile = project.createSourceFile("second.ts", "const reference2 = myFunction;");
      const definitions = (secondSourceFile.getVariableDeclarationOrThrow("reference2").getInitializerOrThrow() as any as Identifier).getDefinitions();
      expect(definitions.length).to.equal(1);
      expect(definitions[0].getName()).to.equal("myFunction");
      expect(definitions[0].getSourceFile().getFullText()).to.equal(sourceFileText);
      expect(definitions[0].getKind()).to.equal(ts.ScriptElementKind.functionElement);
      expect(definitions[0].getTextSpan().getStart()).to.equal(firstChild.getNameNodeOrThrow().getStart());
      expect(definitions[0].getDeclarationNode()).to.equal(firstChild);
    });

    it("should get the definition when nested inside a namespace", () => {
      const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>(
        "namespace N { export function myFunction() {} }\nconst reference = N.myFunction;",
      );
      const definitions = (sourceFile.getVariableDeclarationOrThrow("reference").getInitializerOrThrow() as PropertyAccessExpression)
        .getNameNode().getDefinitions();

      expect(definitions.length).to.equal(1);
      expect(definitions[0].getDeclarationNode()).to.equal(firstChild.getFunctions()[0]);
    });

    it("should get the definition even when near a comma", () => {
      const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>(
        "const someConst=23,myFunction=function () {}; \nconst reference = myFunction();",
      );
      const definitions = (sourceFile.getVariableDeclarationOrThrow("reference").getInitializerOrThrow() as CallExpression)
        .getExpressionIfKindOrThrow(SyntaxKind.Identifier).getDefinitions();

      expect(definitions.length).to.equal(1);
      expect(definitions[0].getDeclarationNode()).to.equal(sourceFile.getVariableDeclarationOrThrow("myFunction"));
    });

    it("should get the container name of what declares the definition", () => {
      const { sourceFile } = getInfoFromText(
        "class C { m() {} }\nnew C().m();\n"
          + "interface I { p: number }\ndeclare const i: I;\ni.p;\n"
          + "enum E { A }\nE.A;\n"
          + "namespace N { export const v = 1; }\nN.v;\n"
          + "namespace Outer { export namespace Inner { export class IC { icm() {} } export enum IE { X } } }\n"
          + "new Outer.Inner.IC().icm();\nOuter.Inner.IE.X;\n"
          + "const obj = { om() {} };\nobj.om();\n"
          + "function topFn() {}\ntopFn();\n",
      );
      const containerNameOf = (name: string) => {
        const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).filter(i => i.getText() === name);
        return identifiers[identifiers.length - 1].getDefinitions().map(d => d.getContainerName());
      };

      expect(containerNameOf("m")).to.deep.equal(["C"]);
      expect(containerNameOf("p")).to.deep.equal(["I"]);
      expect(containerNameOf("A")).to.deep.equal(["E"]);
      expect(containerNameOf("v")).to.deep.equal(["N"]);
      expect(containerNameOf("om")).to.deep.equal(["obj"]);
      // a class container is not qualified by the namespaces around it, while an
      // enum or interface container is — the `typescript` package did the same
      expect(containerNameOf("icm")).to.deep.equal(["IC"]);
      expect(containerNameOf("IC")).to.deep.equal(["Outer.Inner"]);
      expect(containerNameOf("X")).to.deep.equal(["Outer.Inner.IE"]);
      // what a file declares has no container
      expect(containerNameOf("topFn")).to.deep.equal([""]);
    });

    it("should get the container name of a definition that has no name of its own", () => {
      const { sourceFile } = getInfoFromText(
        "namespace NN { export class NC { constructor(a: number) {} } }\nnew NN.NC(1);\n"
          + "interface CY { (): void }\ndeclare const cy: CY;\ncy();\n"
          + "declare function Inject(): any;\nclass DEC { constructor(@Inject() dp: number) {} }\n"
          + "class SB { static { const inBlock = 1; inBlock; } }\n"
          + "const CE = class { cm() {} };\nnew CE().cm();\n",
      );
      const containerNameOf = (name: string) => {
        const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).filter(i => i.getText() === name);
        return identifiers[identifiers.length - 1].getDefinitions().map(d => d.getContainerName());
      };

      // a constructor and a call signature have no name, so they must not be
      // mistaken for the name of what declares them
      expect(containerNameOf("NC")).to.deep.equal(["NN", "NC"]);
      expect(containerNameOf("cy")).to.deep.equal(["", "CY"]);
      // a decorator is not what makes a parameter a property
      expect(containerNameOf("dp")).to.deep.equal([""]);
      expect(containerNameOf("inBlock")).to.deep.equal([""]);
      // an unnamed class is named after the variable it is written in
      expect(containerNameOf("cm")).to.deep.equal(["CE"]);
    });

    it("should get the container name of a definition in an ambient module or a global augmentation", () => {
      const { sourceFile } = getInfoFromText(
        "declare module \"bar\" {\n  interface BI { bp: number }\n  enum BE { M }\n  class BC { bcm(): void }\n}\n"
          + "declare module 'sq' { export const sqv: number }\n"
          + "declare global {\n  class GCl { gclm(): void }\n  interface GI { gm(): void }\n}\nexport {};\n",
      );
      const containerNameOf = (name: string) => {
        const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier).filter(i => i.getText() === name);
        return identifiers[identifiers.length - 1].getDefinitions().map(d => d.getContainerName());
      };

      // an ambient module ends the namespace chain rather than joining it
      expect(containerNameOf("bp")).to.deep.equal(["BI"]);
      expect(containerNameOf("M")).to.deep.equal(["BE"]);
      expect(containerNameOf("bcm")).to.deep.equal(["BC"]);
      expect(containerNameOf("BI")).to.deep.equal([`"bar"`]);
      // a single quoted module name is reported double quoted, as it always was
      expect(containerNameOf("sqv")).to.deep.equal([`"sq"`]);
      // so does `declare global`, but it names itself when it is the container
      expect(containerNameOf("gm")).to.deep.equal(["GI"]);
      expect(containerNameOf("GCl")).to.deep.equal(["global"]);
    });
  });

  describe(nameof<Identifier>("getImplementations"), () => {
    it("should get the implementations", () => {
      const sourceFileText = "interface MyInterface {}\nexport class Class1 implements MyInterface {}\nclass Class2 implements MyInterface {}";
      const { firstChild, sourceFile, project } = getInfoFromText<InterfaceDeclaration>(sourceFileText);
      const implementations = firstChild.getNameNode().getImplementations();
      expect(implementations.length).to.equal(2);
      expect(implementations[0].getNode().getText()).to.equal("Class1");
      expect(implementations[1].getNode().getText()).to.equal("Class2");
    });
  });

  describe(nameof<Identifier>("findReferences"), () => {
    it("should find all the references", () => {
      const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
      const secondSourceFile = project.createSourceFile("second.ts", "const reference2 = myFunction;");
      const referencedSymbols = firstChild.getNameNodeOrThrow().findReferences();
      expect(referencedSymbols.length).to.equal(1);
      const referencedSymbol = referencedSymbols[0];
      const references = referencedSymbol.getReferences();

      // definition
      const definition = referencedSymbol.getDefinition();
      expect(definition.getSourceFile()).to.equal(sourceFile);
      expect(definition.getContainerName()).to.equal("");
      expect(definition.getContainerKind()).to.equal("");
      expect(definition.getKind()).to.equal("function");
      expect(definition.getName()).to.equal("function myFunction(): void");
      expect(definition.getTextSpan().getStart()).to.equal(9);
      expect(definition.getTextSpan().getLength()).to.equal("myFunction".length);
      // tsgo splits the display text into fewer runs than the `typescript` package
      // did: the keyword carries the space that followed it rather than the space
      // being a run of its own
      expect(definition.getDisplayParts()[0].getText()).to.equal("function "); // only bother testing the first one
      expect(definition.getDisplayParts()[0].getKind()).to.equal("keyword");

      // first reference
      expect(references[0].getSourceFile()).to.equal(sourceFile);
      expect(references[0].getTextSpan().getStart()).to.equal(9);
      expect(references[0].getTextSpan().getLength()).to.equal("myFunction".length);
      expect(references[0].isDefinition()).to.equal(true);
      expect(references[0].isInString()).to.equal(undefined);
      expect(references[0].isWriteAccess()).to.equal(true);
      expect(references[0].getNode().getParentOrThrow().getKind()).to.equal(SyntaxKind.FunctionDeclaration);

      // second reference
      expect(references[1].getSourceFile()).to.equal(sourceFile);
      expect(references[1].getTextSpan().getStart()).to.equal(43);
      expect(references[1].getTextSpan().getLength()).to.equal("myFunction".length);
      expect(references[1].isDefinition()).to.equal(false);
      expect(references[1].isInString()).to.equal(undefined);
      expect(references[1].isWriteAccess()).to.equal(false);
      expect(references[1].getNode().getParentOrThrow().getKind()).to.equal(SyntaxKind.VariableDeclaration);

      // third reference
      expect(references[2].getSourceFile()).to.equal(secondSourceFile);
      expect(references[2].getTextSpan().getStart()).to.equal(19);
      expect(references[2].getTextSpan().getLength()).to.equal("myFunction".length);
      expect(references[2].isDefinition()).to.equal(false);
      expect(references[2].isInString()).to.equal(undefined);
      expect(references[2].isWriteAccess()).to.equal(false);
      expect(references[2].getNode().getParentOrThrow().getKind()).to.equal(SyntaxKind.VariableDeclaration);
    });

    it("should get the right node when the reference is at the start of a property access expression", () => {
      const { firstChild, sourceFile, project } = getInfoFromText<ModuleDeclaration>(`
namespace MyNamespace {
    export class MyClass {
    }
}

const t = MyNamespace.MyClass;
`);
      const referencedSymbols = (firstChild.getNameNode() as Identifier).findReferences();
      expect(referencedSymbols.length).to.equal(1);
      const referencedSymbol = referencedSymbols[0];
      const references = referencedSymbol.getReferences();
      const propAccessExpr = sourceFile.getVariableDeclarations()[0].getInitializerOrThrow() as PropertyAccessExpression;
      expect(references[1].getNode()).to.equal(propAccessExpr.getExpression());
    });
  });

  describe(nameof<Identifier>("findReferencesAsNodes"), () => {
    it("should find all the references and exclude the definition", () => {
      const { firstChild, sourceFile, project } = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
      const secondSourceFile = project.createSourceFile("second.ts", "const reference2 = myFunction;");
      const referencingNodes = firstChild.getNameNodeOrThrow().findReferencesAsNodes();
      expect(referencingNodes.length).to.equal(2);
      expect(referencingNodes[0].getParentOrThrow().getText()).to.equal("reference = myFunction");
      expect(referencingNodes[1].getParentOrThrow().getText()).to.equal("reference2 = myFunction");
    });
  });

  describe(nameof<Identifier>("getDefinitionNodes"), () => {
    it("should get the definition nodes", () => {
      const { sourceFile } = getInfoFromText<FunctionDeclaration>("function myFunction() {}\nconst reference = myFunction;");
      const definitionNodes = sourceFile.getVariableDeclarationOrThrow("reference")
        .getInitializerIfKindOrThrow(SyntaxKind.Identifier)
        .getDefinitionNodes();
      expect(definitionNodes.length).to.equal(1);
      expect(definitionNodes[0].getText()).to.equal("function myFunction() {}");
    });

    it("should get the namespace import identifier of one that's exported from an imported namespace export that doesn't import a namespace", () => {
      const project = new Project({ useInMemoryFileSystem: true });
      const mainSourceFile = project.createSourceFile("main.ts", `import * as ts from "./Test"; export { ts };`);
      project.createSourceFile("Test.ts", `export class Test {}`);

      const ident = mainSourceFile.getExportDeclarations()[0].getNamedExports()[0].getNameNode();
      expect((ident as Identifier).getDefinitionNodes().map(t => t.getText()))
        .to.deep.equal([`export class Test {}`].sort());
    });
  });

  describe(nameof<Identifier>("getType"), () => {
    function doTest(text: string, expectedTypes: string[]) {
      const { sourceFile } = getInfoFromText(text);
      const identifiers = sourceFile.getDescendantsOfKind(SyntaxKind.Identifier);
      expect(identifiers.map(i => i.getType().getText())).to.deep.equal(expectedTypes);
    }

    it("should get the identifier", () => {
      doTest("class Identifier {}\n var t = Identifier;", ["Identifier", "typeof Identifier", "typeof Identifier"]);
    });
  });
});
