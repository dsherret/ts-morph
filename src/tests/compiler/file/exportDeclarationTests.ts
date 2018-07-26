import { expect } from "chai";
import { ExportDeclaration } from "../../../compiler";
import * as errors from "../../../errors";
import { Project } from "../../../Project";
import { ExportSpecifierStructure } from "../../../structures";
import { getInfoFromText } from "../testHelpers";

describe(nameof(ExportDeclaration), () => {
    describe(nameof<ExportDeclaration>(n => n.isNamespaceExport), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            expect(firstChild.isNamespaceExport()).to.equal(expected);
        }

        it("should be a namespace export when is one", () => {
            doTest("export * from './test'", true);
        });

        it("should not be a namespace export when is a named export", () => {
            doTest(`export {name} from "./test"`, false);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.hasNamedExports), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            expect(firstChild.hasNamedExports()).to.equal(expected);
        }

        it("should not have any named exports when is a namespace export", () => {
            doTest("export * from './test'", false);
        });

        it("should have named exports when has one", () => {
            doTest(`export {name} from "./test"`, true);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.setModuleSpecifier), () => {
        function doTest(text: string, newModuleSpecifier: string, expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(text);
            firstChild.setModuleSpecifier(newModuleSpecifier);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should set the module specifier when using single quotes", () => {
            doTest(`export * from './test';`, "./new-test", `export * from './new-test';`);
        });

        it("should set the module specifier when using double quotes", () => {
            doTest(`export * from "./test";`, "./new-test", `export * from "./new-test";`);
        });

        it("should set the module specifier when it's empty", () => {
            doTest(`export * from "";`, "./new-test", `export * from "./new-test";`);
        });

        it("should set the module specifier when it doesn't exist", () => {
            doTest(`export {test};`, "./new-test", `export {test} from "./new-test";`);
        });

        it("should set the module specifier when it doesn't exist and there's no semi-colon", () => {
            doTest(`export {test}`, "./new-test", `export {test} from "./new-test"`);
        });

        it("should set the module specifier when it's provided a source file", () => {
            doTest(`export {test}`, "./new-test", `export {test} from "./new-test"`);
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(`export {test} from "./other";`);
            firstChild.setModuleSpecifier(sourceFile.copy("newFile.ts"));
            expect(sourceFile.getText()).to.equal(`export {test} from "./newFile";`);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.getModuleSpecifier), () => {
        function doTest(text: string, expected: string | undefined) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            if (expected == null)
                expect(firstChild.getModuleSpecifier()).to.equal(undefined);
            else
                expect(firstChild.getModuleSpecifier()!.getText()).to.equal(expected);
        }

        it("should get the module specifier text", () => {
            doTest("export * from './test'", "'./test'");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest(`export {name}`, undefined);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.getModuleSpecifierValue), () => {
        function doTest(text: string, expected: string | undefined) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            expect(firstChild.getModuleSpecifierValue()).to.equal(expected);
        }

        it("should get the module specifier when using single quotes", () => {
            doTest("export * from './test'", "./test");
        });

        it("should get the module specifier when using double quotes", () => {
            doTest(`export {name} from "./test"`, "./test");
        });

        it("should return undefined when it doesn't exist", () => {
            doTest(`export {name}`, undefined);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.hasModuleSpecifier), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            expect(firstChild.hasModuleSpecifier()).to.equal(expected);
        }

        it("should have a module specifier when using single quotes", () => {
            doTest("export * from './test'", true);
        });

        it("should have a module specifier when using double quotes", () => {
            doTest(`export {name} from "./test"`, true);
        });

        it("should not have a module specifier when one doesn't exist", () => {
            doTest(`export {name}`, false);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.getModuleSpecifierSourceFileOrThrow), () => {
        it("should get the source file when it exists", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";`);
            const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

            expect(mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFileOrThrow()).to.equal(classSourceFile);
        });

        it("should throw when the referenced file doesn't exist", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";`);

            expect(() => mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFileOrThrow()).to.throw();
        });

        it("should throw when there is no module specifier", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `export {MyClass};`);

            expect(() => mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFileOrThrow()).to.throw();
        });
    });

    describe(nameof<ExportDeclaration>(n => n.getModuleSpecifierSourceFile), () => {
        it("should get the source file when it exists", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";`);
            const classSourceFile = project.createSourceFile("class.ts", `export class Class {}`);

            expect(mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFile()).to.equal(classSourceFile);
        });

        it("should get the source file when it's an index.ts file", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";`);
            const classSourceFile = project.createSourceFile("class/index.ts", `export class Class {}`);

            expect(mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFile()).to.equal(classSourceFile);
        });

        it("should return undefined when the referenced file doesn't exist", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `export * from "./class";`);

            expect(mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFile()).to.be.undefined;
        });

        it("should return undefined when there is no module specifier", () => {
            const project = new Project({ useVirtualFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `export {MyClass};`);

            expect(mainSourceFile.getExportDeclarations()[0].getModuleSpecifierSourceFile()).to.be.undefined;
        });
    });

    describe(nameof<ExportDeclaration>(n => n.isModuleSpecifierRelative), () => {
        function doTest(text: string, expected: boolean) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            expect(firstChild.isModuleSpecifierRelative()).to.equal(expected);
        }

        it("should be when using ./", () => {
            doTest("export * from './test'", true);
        });

        it("should be when using ../", () => {
            doTest("export * from '../test'", true);
        });

        it("should not be when using /", () => {
            doTest("export * from '/test'", false);
        });

        it("should not be when not", () => {
            doTest("export * from 'test'", false);
        });

        it("should not be when not existing", () => {
            doTest("export {test}", false);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.getNamedExports), () => {
        function doTest(text: string, expected: { name: string; alias?: string; }[]) {
            const {firstChild} = getInfoFromText<ExportDeclaration>(text);
            const namedExports = firstChild.getNamedExports();
            expect(namedExports.length).to.equal(expected.length);
            for (let i = 0; i < namedExports.length; i++) {
                expect(namedExports[i].getNameNode().getText()).to.equal(expected[i].name);
                if (expected[i].alias == null)
                    expect(namedExports[i].getAliasNode()).to.equal(undefined);
                else
                    expect(namedExports[i].getAliasNode()!.getText()).to.equal(expected[i].alias);
            }
        }

        it("should get the named exports", () => {
            doTest(`export {name, name2, name3 as name4} from "./test";`, [{ name: "name" }, { name: "name2" }, { name: "name3", alias: "name4" }]);
        });

        it("should not get anything when only a namespace export exists", () => {
            doTest(`export * from "./test";`, []);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.insertNamedExports), () => {
        function doTest(text: string, index: number, structures: (ExportSpecifierStructure | string)[], expected: string, surroundWithSpaces = true) {
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(text);
            if (!surroundWithSpaces)
                firstChild.context.manipulationSettings.set({ insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: false });
            firstChild.insertNamedExports(index, structures);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should insert named exports when doing a namespace export", () => {
            doTest(`export * from "./test";`, 0, [{ name: "name", alias: "alias" }], `export { name as alias } from "./test";`);
        });

        it("should insert named exports at the start", () => {
            doTest(`export { name3 } from "./test";`, 0, [{ name: "name1" }, "name2"], `export { name1, name2, name3 } from "./test";`);
        });

        it("should insert named exports at the start when it shouldn't use a space", () => {
            doTest(`export {name2} from "./test";`, 0, ["name1"], `export {name1, name2} from "./test";`, false);
        });

        it("should insert named exports at the end", () => {
            doTest(`export { name1 } from "./test";`, 1, ["name2", { name: "name3" }], `export { name1, name2, name3 } from "./test";`);
        });

        it("should insert named exports at the end when it shouldn't use a space", () => {
            doTest(`export {name1} from "./test";`, 1, ["name2"], `export {name1, name2} from "./test";`, false);
        });

        it("should insert named exports in the middle", () => {
            doTest(`export {name1, name4} from "./test";`, 1, [{ name: "name2" }, { name: "name3" }], `export {name1, name2, name3, name4} from "./test";`);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.insertNamedExport), () => {
        function doTest(text: string, index: number, structureOrName: (ExportSpecifierStructure | string), expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(text);
            firstChild.insertNamedExport(index, structureOrName);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should insert at the specified index", () => {
            doTest(`export {name1, name3} from "./test";`, 1, { name: "name2" }, `export {name1, name2, name3} from "./test";`);
        });

        it("should insert at the specified index as a string", () => {
            doTest(`export {name1, name3} from "./test";`, 1, "name2", `export {name1, name2, name3} from "./test";`);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.addNamedExport), () => {
        function doTest(text: string, structureOrName: (ExportSpecifierStructure | string), expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(text);
            firstChild.addNamedExport(structureOrName);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should add at the end", () => {
            doTest(`export { name1, name2 } from "./test";`, { name: "name3" }, `export { name1, name2, name3 } from "./test";`);
        });

        it("should add at the end as a string", () => {
            doTest(`export { name1, name2 } from "./test";`, "name3", `export { name1, name2, name3 } from "./test";`);
        });
    });

    describe(nameof<ExportDeclaration>(n => n.addNamedExports), () => {
        function doTest(text: string, structures: (ExportSpecifierStructure | string)[], expected: string) {
            const {firstChild, sourceFile} = getInfoFromText<ExportDeclaration>(text);
            firstChild.addNamedExports(structures);
            expect(sourceFile.getText()).to.equal(expected);
        }

        it("should add named exports at the end", () => {
            doTest(`export { name1 } from "./test";`, [{ name: "name2" }, "name3"], `export { name1, name2, name3 } from "./test";`);
        });
    });

    describe(nameof<ExportDeclaration>(d => d.remove), () => {
        function doTest(text: string, index: number, expectedText: string) {
            const {sourceFile} = getInfoFromText(text);
            sourceFile.getExportDeclarations()[index].remove();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should remove the export declaration", () => {
            doTest("export * from 'i';\nexport * from 'j';\nexport * from 'k';\n", 1, "export * from 'i';\nexport * from 'k';\n");
        });
    });

    describe(nameof<ExportDeclaration>(n => n.toNamespaceExport), () => {
        function doTest(text: string, expectedText: string) {
            const {sourceFile, firstChild} = getInfoFromText<ExportDeclaration>(text);
            firstChild.toNamespaceExport();
            expect(sourceFile.getFullText()).to.equal(expectedText);
        }

        it("should throw when no module specifier exists", () => {
            const {sourceFile, firstChild} = getInfoFromText<ExportDeclaration>(`export {name};`);
            expect(() => firstChild.toNamespaceExport()).to.throw(errors.InvalidOperationError);
        });

        it("should change to a namespace import when there's only one to remove", () => {
            doTest(`export {name} from "./test";`, `export * from "./test";`);
        });

        it("should change to a namespace import when there's multiple to remove", () => {
            doTest(`export {name, name2, name3, name4} from "./test";`, `export * from "./test";`);
        });
    });
});
