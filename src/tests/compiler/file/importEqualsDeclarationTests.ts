import {expect} from "chai";
import {ImportEqualsDeclaration} from "../../../compiler";
import {Project} from "../../../Project";
import {SyntaxKind} from "../../../typescript";
import {getInfoFromText} from "../testHelpers";

describe(nameof(ImportEqualsDeclaration), () => {
    describe(nameof<ImportEqualsDeclaration>(n => n.getName), () => {
        function doTest(text: string, expected: string) {
            const {firstChild} = getInfoFromText<ImportEqualsDeclaration>(text);
            expect(firstChild.getName()).to.equal(expected);
        }

        it("should get the name", () => {
            doTest("import test = Namespace.Test;", "test");
        });
    });

    describe(nameof<ImportEqualsDeclaration>(n => n.getModuleReference), () => {
        function doTest(text: string, expected: string) {
            const {firstChild} = getInfoFromText<ImportEqualsDeclaration>(text);
            expect(firstChild.getModuleReference().getText()).to.equal(expected);
        }

        it("should get the module reference when specifying an entity", () => {
            doTest("import test = Namespace.Test;", "Namespace.Test");
        });

        it("should get the module specifier when importing a require", () => {
            doTest(`import test = require("testing");`, `require("testing")`);
        });
    });

    describe(nameof<ImportEqualsDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            (sourceFile.getStatements()[index] as ImportEqualsDeclaration).remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the import equals declaration", () => {
            doTest("import test = Namespace.Test;", 0, "");
        });
    });

    describe(nameof<ImportEqualsDeclaration>(n => n.getExternalModuleReferenceSourceFile), () => {
        it("should get the referenced source file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);
            const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

            expect(mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ImportEqualsDeclaration).getExternalModuleReferenceSourceFile()).to.equal(classSourceFile);
        });

        it("should return undefined when the referenced file doesn't exist", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);

            expect(mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ImportEqualsDeclaration).getExternalModuleReferenceSourceFile()).to.be.undefined;
        });

        it("should return undefined when doesn't have an external module reference", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = Namespace.Test);`);

            expect(mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ImportEqualsDeclaration).getExternalModuleReferenceSourceFile()).to.be.undefined;
        });
    });

    describe(nameof<ImportEqualsDeclaration>(n => n.getExternalModuleReferenceSourceFileOrThrow), () => {
        it("should get the referenced source file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = require('./class');`);
            const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

            expect(mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ImportEqualsDeclaration).getExternalModuleReferenceSourceFileOrThrow()).to.equal(classSourceFile);
        });

        it("should throw when doesn't have an external module reference", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import test = Namespace.Test;`);

            expect(() => mainSourceFile.getFirstDescendantByKindOrThrow(SyntaxKind.ImportEqualsDeclaration).getExternalModuleReferenceSourceFileOrThrow()).to.throw();
        });
    });
});
