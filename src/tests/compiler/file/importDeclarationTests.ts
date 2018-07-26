import { expect } from "chai";
import { ImportDeclaration } from "../../../compiler";
import * as errors from "../../../errors";
import { Project } from "../../../Project";
import { ImportSpecifierStructure } from "../../../structures";
import { ModuleResolutionKind } from "../../../typescript";
import { getInfoFromText } from "../testHelpers";

describe(nameof(ImportDeclaration), () => {
    describe(nameof<ImportDeclaration>(n => n.setModuleSpecifier), () => {
        function doTest(text: string, newModuleSpecifier: string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            firstChild.setModuleSpecifier(newModuleSpecifier);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should set the module specifier when using single quotes", () => {
            doTest(`import test from './test';`, "./new-test", `import test from './new-test';`);
        });

        it("should set the module specifier when using double quotes", () => {
            doTest(`import test from "./test";`, "./new-test", `import test from "./new-test";`);
        });

        it("should set the module specifier when it's empty", () => {
            doTest(`import test from "";`, "./new-test", `import test from "./new-test";`);
        });

        it("should set the module specifier when it's provided a source file", () => {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(`import {test} from "./other";`);
            firstChild.setModuleSpecifier(sourceFile.copy("newFile.ts"));
            expect(sourceFile.getText()).to.equal(`import {test} from "./newFile";`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getModuleSpecifier), () => {
        function doTest(text: string, expected: string) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            expect(firstChild.getModuleSpecifier().getText()).to.equal(expected);
        }

        it("should get the module specifier", () => {
            doTest("import * as test from './test'", "'./test'");
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getModuleSpecifierValue), () => {
        function doTest(text: string, expected: string) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            expect(firstChild.getModuleSpecifierValue()).to.equal(expected);
        }

        it("should get the module specifier when using single quotes", () => {
            doTest("import * as test from './test'", "./test");
        });

        it("should get the module specifier when using double quotes", () => {
            doTest(`import defaultExport, {test} from "./test"`, "./test");
        });

        it("should get the module specifier when importing for side effects", () => {
            doTest(`import "./test"`, "./test");
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getModuleSpecifierSourceFileOrThrow), () => {
        it("should get the source file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import {Class} from "./class";`);
            const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

            expect(mainSourceFile.getImportDeclarations()[0].getModuleSpecifierSourceFileOrThrow()).to.equal(classSourceFile);
        });

        it("should throw when it doesn't exist", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import {Class} from "./class";`);

            expect(() => mainSourceFile.getImportDeclarations()[0].getModuleSpecifierSourceFileOrThrow()).to.throw();
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getModuleSpecifierSourceFile), () => {
        it("should get the source file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import {Class} from "./class";`);
            const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

            expect(mainSourceFile.getImportDeclarations()[0].getModuleSpecifierSourceFile()).to.equal(classSourceFile);
        });

        it("should get the source file when it's an index.ts file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import {Class} from "./class";`);
            const classSourceFile = project.createSourceFile("class/index.ts", `export class Class {}`);

            expect(mainSourceFile.getImportDeclarations()[0].getModuleSpecifierSourceFile()).to.equal(classSourceFile);
        });

        it("should not get the source file when it's an index.ts file and using classic module resolution", () => {
            // needs to be NodeJs resolution to work
            const project = new Project({ useVirtualFileSystem: true, compilerOptions: { moduleResolution: ModuleResolutionKind.Classic } });
            const mainSourceFile = project.createSourceFile("main.ts", `import {Class} from "./class";`);
            const classSourceFile = project.createSourceFile("class/index.ts", `export class Class {}`);

            expect(mainSourceFile.getImportDeclarations()[0].getModuleSpecifierSourceFile()).to.be.undefined;
        });

        it("should return undefined when it doesn't exist", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import {Class} from "./class";`);

            expect(mainSourceFile.getImportDeclarations()[0].getModuleSpecifierSourceFile()).to.be.undefined;
        });
    });

    describe(nameof<ImportDeclaration>(n => n.isModuleSpecifierRelative), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            expect(firstChild.isModuleSpecifierRelative()).to.equal(expected);
        }

        it("should be when using ./", () => {
            doTest("import * as test from './test'", true);
        });

        it("should be when using ../", () => {
            doTest("import * as test from '../test'", true);
        });

        it("should not be when using /", () => {
            doTest("import * as test from '/test'", false);
        });

        it("should not be when not", () => {
            doTest("import * as test from 'test'", false);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.setDefaultImport), () => {
        function doTest(text: string, newDefaultImport: string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            firstChild.setDefaultImport(newDefaultImport);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should throw when whitespace", () => {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>("import d from './file';");
            expect(() => firstChild.setDefaultImport(" ")).to.throw(errors.ArgumentNullOrWhitespaceError);
        });

        it("should rename when exists", () => {
            doTest(`import identifier from './file'; const t = identifier;`, "newName", `import newName from './file'; const t = newName;`);
        });

        it("should set the default import when importing for side effects", () => {
            doTest(`import './file';`, "identifier", `import identifier from './file';`);
        });

        it("should set the default import when named import exists", () => {
            doTest(`import {named} from './file';`, "identifier", `import identifier, {named} from './file';`);
        });

        it("should set the default import when namespace import exists", () => {
            doTest(`import * as name from './file';`, "identifier", `import identifier, * as name from './file';`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getDefaultImport), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const defaultImport = firstChild.getDefaultImport();
            if (expectedName == null)
                expect(defaultImport).to.be.undefined;
            else
                expect(defaultImport!.getText()).to.equal(expectedName);
        }

        it("should get the default import when it exists", () => {
            doTest(`import defaultImport from "./test";`, "defaultImport");
        });

        it("should get the default import when a named import exists as well", () => {
            doTest(`import defaultImport, {name as any} from "./test";`, "defaultImport");
        });

        it("should get the default import when a namespace import exists as well", () => {
            doTest(`import defaultImport, * as name from "./test";`, "defaultImport");
        });

        it("should not get the default import when a named import exists", () => {
            doTest(`import {name as any} from "./test";`, undefined);
        });

        it("should not get the default import when a namespace import exists", () => {
            doTest(`import * as name from "./test";`, undefined);
        });

        it("should not get the default import when importing for the side effects", () => {
            doTest(`import "./test";`, undefined);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getDefaultImport), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const { firstChild } = getInfoFromText<ImportDeclaration>(text);
            if (expectedName == null)
                expect(() => firstChild.getDefaultImportOrThrow()).to.throw();
            else
                expect(firstChild.getDefaultImportOrThrow().getText()).to.equal(expectedName);
        }

        it("should get the default import when it exists", () => {
            doTest(`import defaultImport from "./test";`, "defaultImport");
        });

        it("should throw when default import does not exists", () => {
            doTest(`import { named } from "./test";`, undefined);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.setNamespaceImport), () => {
        function doTest(text: string, newNamespaceImport: string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            firstChild.setNamespaceImport(newNamespaceImport);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should rename when exists", () => {
            doTest(`import * as identifier from './file'; const t = identifier;`, "newName", `import * as newName from './file'; const t = newName;`);
        });

        it("should set the namespace import when importing for side effects", () => {
            doTest(`import './file';`, "identifier", `import * as identifier from './file';`);
        });

        it("should remove it when providing an empty string", () => {
            doTest(`import * as identifier from './file';`, "", `import './file';`);
        });

        it("should do nothing when it doesn't exist and providing an empty string", () => {
            doTest(`import './file';`, "", `import './file';`);
        });

        it("should throw an error when a named import exists", () => {
            expect(() => {
                const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(`import {named} from './file';`);
                firstChild.setNamespaceImport("identifier");
            }).to.throw();
        });

        it("should set the namespace import when a default import exists", () => {
            doTest(`import name from './file';`, "identifier", `import name, * as identifier from './file';`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getNamespaceImportOrThrow), () => {
        function doTest(text: string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            firstChild.removeNamespaceImport();
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should remove it when a namespace import exists", () => {
            doTest(`import * as identifier from './file';`, `import './file';`);
        });

        it("should do nothing when a namespace import doesn't exists", () => {
            doTest(`import './file';`, `import './file';`);
        });

        it("should remove it when a default import exists", () => {
            doTest(`import name, * as identifier from './file';`, `import name from './file';`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getNamespaceImport), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const identifier = firstChild.getNamespaceImport();
            if (expectedName == null)
                expect(identifier).to.be.undefined;
            else
                expect(identifier!.getText()).to.equal(expectedName);
        }

        it("should get the namespace import when it exists", () => {
            doTest(`import * as name from "./test";`, "name");
        });

        it("should get the namespace import when a default import exists as well", () => {
            doTest(`import defaultImport, * as name from "./test";`, "name");
        });

        it("should not get the default import when a default and named import exist", () => {
            doTest(`import defaultImport, {name as any} from "./test";`, undefined);
        });

        it("should not get the namespace import when a named import exists", () => {
            doTest(`import {name as any} from "./test";`, undefined);
        });

        it("should not get the namespace import when a default import exists", () => {
            doTest(`import defaultImport from "./test";`, undefined);
        });

        it("should not get the namespace import when importing for the side effects", () => {
            doTest(`import "./test";`, undefined);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getNamespaceImportOrThrow), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const { firstChild } = getInfoFromText<ImportDeclaration>(text);
            if (expectedName == null)
                expect(() => firstChild.getNamespaceImportOrThrow()).to.throw();
            else
                expect(firstChild.getNamespaceImportOrThrow().getText()).to.equal(expectedName);
        }

        it("should get the namespace import when it exists", () => {
            doTest(`import * as name from "./test";`, "name");
        });

        it("should throw when the namespace import doesn't exist", () => {
            doTest(`import "./test";`, undefined);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getNamedImports), () => {
        function doTest(text: string, expected: { name: string; alias?: string; }[]) {
            const {firstChild} = getInfoFromText<ImportDeclaration>(text);
            const namedImports = firstChild.getNamedImports();
            expect(namedImports.length).to.equal(expected.length);
            for (let i = 0; i < namedImports.length; i++) {
                expect(namedImports[i].getNameNode().getText()).to.equal(expected[i].name);
                if (expected[i].alias == null)
                    expect(namedImports[i].getAliasNode()).to.equal(undefined);
                else
                    expect(namedImports[i].getAliasNode()!.getText()).to.equal(expected[i].alias);
            }
        }

        it("should get the named imports", () => {
            doTest(`import {name, name2, name3 as name4} from "./test";`, [{ name: "name" }, { name: "name2" }, { name: "name3", alias: "name4" }]);
        });

        it("should get the named import when a default and named import exist", () => {
            doTest(`import defaultImport, {name as any} from "./test";`, [{ name: "name", alias: "any" }]);
        });

        it("should not get anything when only a namespace import exists", () => {
            doTest(`import * as name from "./test";`, []);
        });

        it("should not get anything when a a namespace import and a default import exists", () => {
            doTest(`import defaultImport, * as name from "./test";`, []);
        });

        it("should not get anything when a default import exists", () => {
            doTest(`import defaultImport from "./test";`, []);
        });

        it("should not get anything when importing for the side effects", () => {
            doTest(`import "./test";`, []);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.insertNamedImports), () => {
        function doTest(text: string, index: number, structuresOrNames: (ImportSpecifierStructure | string)[], expected: string, surroundWithSpaces = true) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            if (!surroundWithSpaces)
                firstChild.context.manipulationSettings.set({ insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false });
            firstChild.insertNamedImports(index, structuresOrNames);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should insert named imports when importing for the side effects", () => {
            doTest(`import "./test";`, 0, ["name", { name: "name", alias: "alias" }], `import { name, name as alias } from "./test";`);
        });

        it("should insert named imports when a default import exists", () => {
            doTest(`import Default from "./test";`, 0, [{ name: "name" }, { name: "name2" }], `import Default, { name, name2 } from "./test";`);
        });

        it("should insert named imports at the start", () => {
            doTest(`import { name3 } from "./test";`, 0, [{ name: "name1" }, { name: "name2" }], `import { name1, name2, name3 } from "./test";`);
        });

        it("should insert named imports at the start when it shouldn't use a space", () => {
            doTest(`import {name2} from "./test";`, 0, ["name1"], `import {name1, name2} from "./test";`, false);
        });

        it("should insert named imports at the end", () => {
            doTest(`import { name1 } from "./test";`, 1, [{ name: "name2" }, { name: "name3" }], `import { name1, name2, name3 } from "./test";`);
        });

        it("should insert named imports at the end when it shouldn't use a space", () => {
            doTest(`import {name1} from "./test";`, 1, ["name2"], `import {name1, name2} from "./test";`, false);
        });

        it("should insert named imports in the middle", () => {
            doTest(`import {name1, name4} from "./test";`, 1, [{ name: "name2" }, { name: "name3" }], `import {name1, name2, name3, name4} from "./test";`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.insertNamedImport), () => {
        function doTest(text: string, index: number, structureOrName: ImportSpecifierStructure | string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            firstChild.insertNamedImport(index, structureOrName);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should insert at the specified index", () => {
            doTest(`import {name1, name3} from "./test";`, 1, { name: "name2" }, `import {name1, name2, name3} from "./test";`);
        });

        it("should insert at the specified index as a string", () => {
            doTest(`import {name1, name3} from "./test";`, 1, "name2", `import {name1, name2, name3} from "./test";`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.addNamedImport), () => {
        function doTest(text: string, structureOrName: ImportSpecifierStructure | string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            firstChild.addNamedImport(structureOrName);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should add at the end", () => {
            doTest(`import { name1, name2 } from "./test";`, { name: "name3" }, `import { name1, name2, name3 } from "./test";`);
        });

        it("should add at the end as a string", () => {
            doTest(`import { name1, name2 } from "./test";`, "name3", `import { name1, name2, name3 } from "./test";`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.addNamedImports), () => {
        function doTest(text: string, structures: (ImportSpecifierStructure | string)[], expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ImportDeclaration>(text);
            firstChild.addNamedImports(structures);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should add named imports at the end", () => {
            doTest(`import { name1 } from "./test";`, [{ name: "name2" }, { name: "name3" }, "name4"], `import { name1, name2, name3, name4 } from "./test";`);
        });
    });

    describe(nameof<ImportDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getImportDeclarations()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the import declaration", () => {
            doTest("import * from 'i';\nimport * from 'j';\nimport * from 'k';\n", 1, "import * from 'i';\nimport * from 'k';\n");
        });
    });

    describe(nameof<ImportDeclaration>(d => d.removeNamedImports), () => {
        function doTest(text: string, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getImportDeclarations()[0].removeNamedImports();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the named imports when only named imports exist", () => {
            doTest(`import {Name1, Name2} from "module-name";`, `import "module-name";`);
        });

        it("should remove the named imports when a default import exist", () => {
            doTest(`import defaultExport, {Name1, Name2} from "module-name";`, `import defaultExport from "module-name";`);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getImportClauseOrThrow), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const { firstChild } = getInfoFromText<ImportDeclaration>(text);
            if (expectedName == null)
                expect(() => firstChild.getImportClauseOrThrow()).to.throw();
            else
                expect(firstChild.getImportClauseOrThrow().getText()).to.equal(expectedName);
        }

        it("should get the import clause when it exists", () => {
            doTest(`import * as name from "./test";`, "* as name");
        });

        it("should throw when the import clause doesn't exist", () => {
            doTest(`import "./test";`, undefined);
        });
    });

    describe(nameof<ImportDeclaration>(n => n.getImportClause), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const { firstChild } = getInfoFromText<ImportDeclaration>(text);
            if (expectedName == null)
                expect(firstChild.getImportClause()).to.be.undefined;
            else
                expect(firstChild.getImportClause()!.getText()).to.equal(expectedName);
        }

        it("should get the import clause when it exists", () => {
            doTest(`import * as name from "./test";`, "* as name");
        });

        it("should return undefined when the import clause doesn't exist", () => {
            doTest(`import "./test";`, undefined);
        });
    });
});
