/**
 * Custom resolution of type reference directives — `/// <reference types="..." />`.
 *
 * Module specifiers can be resolved by a host again (see `resolutionHost` in
 * projectTests.ts), but type reference directives cannot: they resolve down a
 * separate path in the compiler, `Resolver.ResolveTypeReferenceDirective`, which
 * has no hook. This is a TODO rather than a removal.
 *
 * Quarantined because it names `ts.resolveTypeReferenceDirective` and
 * `ts.ResolvedTypeReferenceDirective`, neither of which exists, so the file
 * cannot be type-checked and its imports would abort the mocha run at load.
 */
import { ts } from "@ts-morph/common";
import { expect } from "chai";
import { Identifier } from "../../../compiler";
import { Project } from "../../../Project";

describe("Project", () => {
  describe("custom type reference directive resolution", () => {
    function setup() {
      const fileSystem = new InMemoryFileSystemHost();
      const testFilePath = "/other/test.d.ts";
      fileSystem.writeFileSync("/dir/tsconfig.json", `{ "compilerOptions": { "target": "ES2015" } }`);
      fileSystem.writeFileSync("/dir/main.ts", `/// <reference types="../other/testasdf" />\n\nconst test = new Test();`);
      fileSystem.writeFileSync(testFilePath, `declare class Test {}`);
      fileSystem.getCurrentDirectory = () => "/dir";
      const project = new Project({
        fileSystem,
        resolutionHost: (moduleResolutionHost, getCompilerOptions) => {
          return {
            resolveTypeReferenceDirectives: (typeDirectiveNames: string[] | ts.FileReference[], containingFile: string) => {
              const compilerOptions = getCompilerOptions();
              const resolvedTypeReferenceDirectives: ts.ResolvedTypeReferenceDirective[] = [];

              for (const typeDirectiveName of typeDirectiveNames.map(replaceAsdfExtension)) {
                const result = ts.resolveTypeReferenceDirective(typeDirectiveName, containingFile, compilerOptions, moduleResolutionHost);
                if (result.resolvedTypeReferenceDirective)
                  resolvedTypeReferenceDirectives.push(result.resolvedTypeReferenceDirective);
              }

              return resolvedTypeReferenceDirectives;
            },
          };

          function replaceAsdfExtension(moduleName: string | ts.FileReference) {
            moduleName = typeof moduleName === "string" ? moduleName : moduleName.fileName;
            return moduleName.replace("asdf", "");
          }
        },
        tsConfigFilePath: "/dir/tsconfig.json",
        skipLoadingLibFiles: true,
      });

      const mainFile = project.getSourceFileOrThrow("main.ts");
      const testIdentifier = mainFile.getFirstDescendantOrThrow(d => d.getText() === "Test") as Identifier;
      return { project, mainFile, testFilePath, testIdentifier };
    }

    it("should support custom resolution", () => {
      const { testIdentifier } = setup();
      expect(testIdentifier.getDefinitionNodes().map(d => d.getText())).to.deep.equal(["declare class Test {}"]);
    });

    it("should support when renaming with the language service", () => {
      // todo: this should be investigated in the future as this test doesn't fail when the custom type reference directive resolution
      // is not provided to the language service.
      const { testIdentifier } = setup();
      testIdentifier.rename("NewClass");
      expect(testIdentifier.getDefinitionNodes().map(d => d.getText())).to.deep.equal(["declare class NewClass {}"]);
    });
  });
});
