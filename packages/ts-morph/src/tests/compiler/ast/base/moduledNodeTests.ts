import { expect } from "chai";
import { SourceFile, NamespaceDeclaration, ModuledNode, QuoteKind, ImportDeclaration, ExportDeclaration, ExportAssignment,
    ExportedDeclarations } from "../../../../compiler";
import { ImportDeclarationStructure, ExportDeclarationStructure, ExportAssignmentStructure, OptionalKind } from "../../../../structures";
import { Project } from "../../../../Project";
import { getInfoFromText } from "../../testHelpers";

describe(nameof(ModuledNode), () => {
    describe(nameof<ModuledNode>(n => n.insertImportDeclarations), () => {
        function doTest(
            startCode: string,
            index: number,
            structures: OptionalKind<ImportDeclarationStructure>[],
            expectedCode: string,
            useSingleQuotes = false
        ) {
            const { sourceFile, project } = getInfoFromText(startCode);
            if (useSingleQuotes)
                project.manipulationSettings.set({ quoteKind: QuoteKind.Single });
            const result = sourceFile.insertImportDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert the different kinds of imports", () => {
            doTest("", 0, [
                { moduleSpecifier: "./test" },
                { defaultImport: "identifier", moduleSpecifier: "./test" },
                { defaultImport: "identifier", namespaceImport: "name", moduleSpecifier: "./test" },
                { defaultImport: "identifier", namedImports: ["name1", { name: "name" }, { name: "name", alias: "alias" }], moduleSpecifier: "./test" },
                { namedImports: ["name"], moduleSpecifier: "./test" },
                { namespaceImport: "name", moduleSpecifier: "./test" }
            ], [
                `import "./test";`,
                `import identifier from "./test";`,
                `import identifier, * as name from "./test";`,
                `import identifier, { name1, name, name as alias } from "./test";`,
                `import { name } from "./test";`,
                `import * as name from "./test";`
            ].join("\n") + "\n");
        });

        it("should throw when specifying a namespace import and named imports", () => {
            const { sourceFile } = getInfoFromText("");

            expect(() => {
                sourceFile.insertImportDeclarations(0, [{ namespaceImport: "name", namedImports: ["name"], moduleSpecifier: "file" }]);
            }).to.throw();
        });

        it("should insert an import if the file was read with a utf-8 bom", () => {
            doTest("\uFEFF", 0, [{ moduleSpecifier: "./test" }], `import "./test";\n`);
        });

        it("should insert at the beginning and use single quotes when specified", () => {
            doTest(`export class Class {}\n`, 0, [{ moduleSpecifier: "./test" }], `import './test';\n\nexport class Class {}\n`, true);
        });

        it("should insert in the middle", () => {
            doTest(`import "./file1";\nimport "./file3";\n`, 1, [{ moduleSpecifier: "./file2" }], `import "./file1";\nimport "./file2";\nimport "./file3";\n`);
        });

        it("should insert at the end", () => {
            doTest(`export class Class {}\n`, 1, [{ moduleSpecifier: "./test" }], `export class Class {}\n\nimport "./test";\n`);
        });

        it("should support writing named imports with a writer", () => {
            doTest(``, 0, [{ namedImports: writer => writer.writeLine("test,").writeLine("test2"), moduleSpecifier: "./test" }],
                `import { test,\n    test2\n} from "./test";\n`);
        });

        function doNamespaceTest(startCode: string, index: number, structures: OptionalKind<ImportDeclarationStructure>[], expectedCode: string) {
            const { sourceFile, project } = getInfoFromText(startCode);
            const result = sourceFile.getNamespaces()[0].insertImportDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert into namespace", () => {
            doNamespaceTest(`declare module N {\n}`, 0, [{ moduleSpecifier: "./test" }], `declare module N {\n    import "./test";\n}`);
        });
    });

    describe(nameof<ModuledNode>(n => n.insertImportDeclaration), () => {
        function doTest(startCode: string, index: number, structure: OptionalKind<ImportDeclarationStructure>, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertImportDeclaration(index, structure);
            expect(result).to.be.instanceOf(ImportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert at the specified position", () => {
            doTest(`import "./file1";\nimport "./file3";\n`, 1, { moduleSpecifier: "./file2" }, `import "./file1";\nimport "./file2";\nimport "./file3";\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.addImportDeclaration), () => {
        function doTest(startCode: string, structure: OptionalKind<ImportDeclarationStructure>, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addImportDeclaration(structure);
            expect(result).to.be.instanceOf(ImportDeclaration);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should add at the last import if one exists", () => {
            doTest(`import "./file1";\nimport "./file2";\n\nexport class MyClass {}\n`, { moduleSpecifier: "./file3" },
                `import "./file1";\nimport "./file2";\nimport "./file3";\n\nexport class MyClass {}\n`);
        });

        it("should add at the start if no imports exists", () => {
            doTest(`export class MyClass {}\n`, { moduleSpecifier: "./file" }, `import "./file";\n\nexport class MyClass {}\n`);
        });

        it("should insert after any comments at the start of a file", () => {
            doTest(`/* test */`, { moduleSpecifier: "./file" }, `/* test */\nimport "./file";\n`);
        });

        it("should insert before any comments at the start of a file", () => {
            doTest(`// test`, { moduleSpecifier: "./file" }, `import "./file";\n\n// test`);
        });
    });

    describe(nameof<ModuledNode>(n => n.addImportDeclarations), () => {
        function doTest(startCode: string, structures: OptionalKind<ImportDeclarationStructure>[], expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addImportDeclarations(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add at the last import if one exists", () => {
            doTest(`import "./file1";\n\nexport class MyClass {}\n`, [{ moduleSpecifier: "./file2" }, { moduleSpecifier: "./file3" }],
                `import "./file1";\nimport "./file2";\nimport "./file3";\n\nexport class MyClass {}\n`);
        });

        it("should add at the start if no imports exists", () => {
            doTest(`export class MyClass {}\n`, [{ moduleSpecifier: "./file1" }, { moduleSpecifier: "./file2" }],
                `import "./file1";\nimport "./file2";\n\nexport class MyClass {}\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.getImportDeclarations), () => {
        it("should get in a source file", () => {
            const { sourceFile } = getInfoFromText("import myImport from 'test'; import {next} from './test';");
            expect(sourceFile.getImportDeclarations().length).to.equal(2);
            expect(sourceFile.getImportDeclarations()[0]).to.be.instanceOf(ImportDeclaration);
        });

        it("should get in a namespace", () => {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>("declare namespace N { import myImport from 'test'; }");
            expect(firstChild.getImportDeclarations().length).to.equal(1);
            expect(firstChild.getImportDeclarations()[0]).to.be.instanceOf(ImportDeclaration);
        });
    });

    describe(nameof<ModuledNode>(n => n.getImportDeclaration), () => {
        function doTest(text: string, conditionOrModuleSpecifier: string | ((importDeclaration: ImportDeclaration) => boolean), expected: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const result = sourceFile.getImportDeclaration(conditionOrModuleSpecifier);
            expect(result?.getText()).to.equal(expected);
        }

        it("should get the import declaration", () => {
            doTest("import myImport from 'test'; import {next} from './test';", i => i.getDefaultImport() != null, "import myImport from 'test';");
        });

        it("should get the import declaration when providing module specifier text", () => {
            doTest("import myImport from 'test'; import {next} from './test';", "./test", "import {next} from './test';");
        });

        it("should return undefined when not exists", () => {
            doTest("import myImport from 'test';", "asdfasdf", undefined);
        });
    });

    describe(nameof<ModuledNode>(n => n.getImportDeclarationOrThrow), () => {
        function doTest(text: string, conditionOrModuleSpecifier: string | ((importDeclaration: ImportDeclaration) => boolean), expected: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            if (expected == null)
                expect(() => sourceFile.getImportDeclarationOrThrow(conditionOrModuleSpecifier)).to.throw();
            else
                expect(sourceFile.getImportDeclarationOrThrow(conditionOrModuleSpecifier).getText()).to.equal(expected);
        }

        it("should get the import declaration", () => {
            doTest("import myImport from 'test'; import {next} from './test';", i => i.getDefaultImport() != null, "import myImport from 'test';");
        });

        it("should get the import declaration when providing module specifier text", () => {
            doTest("import myImport from 'test'; import {next} from './test';", "./test", "import {next} from './test';");
        });

        it("should throw when not exists", () => {
            doTest("import myImport from 'test';", "asdfasdf", undefined);
        });
    });

    describe(nameof<ModuledNode>(n => n.insertExportDeclarations), () => {
        function doTest(startCode: string, index: number, structures: OptionalKind<ExportDeclarationStructure>[], expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertExportDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert the different kinds of exports", () => {
            doTest("", 0, [
                { moduleSpecifier: "./test" },
                { namedExports: ["name1", { name: "name" }, { name: "name", alias: "alias" }], moduleSpecifier: "./test" },
                { namedExports: ["name"] },
                {}
            ], [
                `export * from "./test";`,
                `export { name1, name, name as alias } from "./test";`,
                `export { name };`,
                `export { };`
            ].join("\n") + "\n");
        });

        it("should insert at the beginning", () => {
            doTest(`export class Class {}\n`, 0, [{ moduleSpecifier: "./test" }], `export * from "./test";\n\nexport class Class {}\n`);
        });

        it("should insert in the middle", () => {
            doTest(`export * from "./file1";\nexport * from "./file3";\n`, 1, [{ moduleSpecifier: "./file2" }],
                `export * from "./file1";\nexport * from "./file2";\nexport * from "./file3";\n`);
        });

        it("should insert at the end", () => {
            doTest(`export class Class {}\n`, 1, [{ moduleSpecifier: "./test" }], `export class Class {}\n\nexport * from "./test";\n`);
        });

        it("should support writing named imports with a writer", () => {
            doTest(``, 0, [{ namedExports: writer => writer.newLine().writeLine("test,").writeLine("test2") }], `export {\n    test,\n    test2\n};\n`);
        });

        it("should insert after any comments at the start of a file", () => {
            doTest(`/* test */`, 1, [{ moduleSpecifier: "./file" }], `/* test */\nexport * from "./file";\n`);
        });

        it("should insert before any comments at the start of a file", () => {
            doTest(`// test`, 0, [{ moduleSpecifier: "./file" }], `export * from "./file";\n\n// test`);
        });

        function doNamespaceTest(startCode: string, index: number, structures: OptionalKind<ExportDeclarationStructure>[], expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.getNamespaces()[0].insertExportDeclarations(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert into namespace", () => {
            doNamespaceTest(`declare module N {\n}`, 0, [{ moduleSpecifier: "./test" }], `declare module N {\n    export * from "./test";\n}`);
        });
    });

    describe(nameof<ModuledNode>(n => n.insertExportDeclaration), () => {
        function doTest(startCode: string, index: number, structure: OptionalKind<ExportDeclarationStructure>, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertExportDeclaration(index, structure);
            expect(result).to.be.instanceOf(ExportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert at the specified position", () => {
            doTest(`export * from "./file1";\nexport * from "./file3";\n`, 1, { moduleSpecifier: "./file2" },
                `export * from "./file1";\nexport * from "./file2";\nexport * from "./file3";\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.addExportDeclaration), () => {
        function doTest(startCode: string, structure: OptionalKind<ExportDeclarationStructure>, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addExportDeclaration(structure);
            expect(result).to.be.instanceOf(ExportDeclaration);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should always add at the end of the file", () => {
            doTest(`export class MyClass {}\n`, { moduleSpecifier: "./file" }, `export class MyClass {}\n\nexport * from "./file";\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.addExportDeclarations), () => {
        function doTest(startCode: string, structures: OptionalKind<ExportDeclarationStructure>[], expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addExportDeclarations(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add multiple", () => {
            doTest(`export class MyClass {}\n`, [{ moduleSpecifier: "./file1" }, { moduleSpecifier: "./file2" }],
                `export class MyClass {}\n\nexport * from "./file1";\nexport * from "./file2";\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.getExportDeclarations), () => {
        it("should get in a source file", () => {
            const { sourceFile } = getInfoFromText("export * from 'test'; export {next} from './test';");
            expect(sourceFile.getExportDeclarations().length).to.equal(2);
            expect(sourceFile.getExportDeclarations()[0]).to.be.instanceOf(ExportDeclaration);
        });

        it("should get in a namespace", () => {
            const { firstChild } = getInfoFromText<NamespaceDeclaration>("declare namespace N { export * from 'test'; }");
            expect(firstChild.getExportDeclarations().length).to.equal(1);
            expect(firstChild.getExportDeclarations()[0]).to.be.instanceOf(ExportDeclaration);
        });
    });

    describe(nameof<ModuledNode>(n => n.getExportDeclaration), () => {
        function doTest(text: string, conditionOrModuleSpecifier: string | ((importDeclaration: ExportDeclaration) => boolean), expected: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const result = sourceFile.getExportDeclaration(conditionOrModuleSpecifier);
            expect(result?.getText()).to.equal(expected);
        }

        it("should get when exists", () => {
            doTest("export * from 'test'; export {next} from './test';", e => e.isNamespaceExport(), "export * from 'test';");
        });

        it("should get when exists by module specifier", () => {
            doTest("export * from 'test'; export {next} from './test';", "./test", "export {next} from './test';");
        });

        it("should return undefined when not exists", () => {
            doTest("export * from 'test'; export {next} from './test';", "not-exists", undefined);
        });
    });

    describe(nameof<ModuledNode>(n => n.getExportDeclarationOrThrow), () => {
        function doTest(text: string, conditionOrModuleSpecifier: string | ((importDeclaration: ExportDeclaration) => boolean), expected: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            if (expected == null)
                expect(() => sourceFile.getExportDeclarationOrThrow(conditionOrModuleSpecifier)).to.throw();
            else
                expect(sourceFile.getExportDeclarationOrThrow(conditionOrModuleSpecifier).getText()).to.equal(expected);
        }

        it("should get when exists", () => {
            doTest("export * from 'test'; export {next} from './test';", e => e.isNamespaceExport(), "export * from 'test';");
        });

        it("should get when exists by module specifier", () => {
            doTest("export * from 'test'; export {next} from './test';", "./test", "export {next} from './test';");
        });

        it("should throw when not exists", () => {
            doTest("export * from 'test'; export {next} from './test';", "not-exists", undefined);
        });
    });

    describe(nameof<ModuledNode>(n => n.insertExportAssignments), () => {
        function doTest(startCode: string, index: number, structures: OptionalKind<ExportAssignmentStructure>[], expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertExportAssignments(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert the different kinds of exports", () => {
            doTest("", 0, [
                { expression: "5" },
                { isExportEquals: true, expression: writer => writer.write("6") },
                { isExportEquals: false, expression: "name" }
            ], [
                `export = 5;`,
                `export = 6;`,
                `export default name;`
            ].join("\n") + "\n");
        });

        it("should insert at the beginning", () => {
            doTest(`export class Class {}\n`, 0, [{ expression: "5" }], `export = 5;\n\nexport class Class {}\n`);
        });

        it("should insert in the middle", () => {
            doTest(`export * from "./file1";\nexport = 6;\n`, 1, [{ expression: "5" }], `export * from "./file1";\n\nexport = 5;\nexport = 6;\n`);
        });

        it("should insert at the end", () => {
            doTest(`export class Class {}\n`, 1, [{ expression: "5" }], `export class Class {}\n\nexport = 5;\n`);
        });

        it("should insert after any comments at the start of a file", () => {
            doTest(`/* test */`, 1, [{ expression: "5" }], `/* test */\nexport = 5;\n`);
        });

        it("should insert before any comments at the start of a file", () => {
            doTest(`// test`, 0, [{ expression: "5" }], `export = 5;\n\n// test`);
        });

        function doNamespaceTest(startCode: string, index: number, structures: OptionalKind<ExportAssignmentStructure>[], expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.getNamespaces()[0].insertExportAssignments(index, structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getFullText()).to.equal(expectedCode);
        }

        it("should insert into a namespace", () => {
            doNamespaceTest(`namespace N {\n    export class Class {}\n}`, 1, [{ expression: "5" }],
                `namespace N {\n    export class Class {}\n\n    export = 5;\n}`);
        });
    });

    describe(nameof<ModuledNode>(n => n.insertExportAssignment), () => {
        function doTest(startCode: string, index: number, structure: OptionalKind<ExportAssignmentStructure>, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.insertExportAssignment(index, structure);
            expect(result).to.be.instanceOf(ExportAssignment);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should insert at the specified position", () => {
            doTest(`export * from "./file1";\nexport = 6;\n`, 1, { expression: "5" }, `export * from "./file1";\n\nexport = 5;\nexport = 6;\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.addExportAssignment), () => {
        function doTest(startCode: string, structure: OptionalKind<ExportAssignmentStructure>, expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addExportAssignment(structure);
            expect(result).to.be.instanceOf(ExportAssignment);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should always add at the end of the file", () => {
            doTest(`export class MyClass {}\n`, { expression: "5" }, `export class MyClass {}\n\nexport = 5;\n`);
        });
    });

    describe(nameof<ModuledNode>(n => n.addExportAssignments), () => {
        function doTest(startCode: string, structures: OptionalKind<ExportAssignmentStructure>[], expectedCode: string) {
            const { sourceFile } = getInfoFromText(startCode);
            const result = sourceFile.addExportAssignments(structures);
            expect(result.length).to.equal(structures.length);
            expect(sourceFile.getText()).to.equal(expectedCode);
        }

        it("should add multiple", () => {
            doTest(`export class MyClass {}\n`, [{ expression: "5" }, { expression: "6" }], `export class MyClass {}\n\nexport = 5;\nexport = 6;\n`);
        });
    });

    describe(nameof<SourceFile>(n => n.getExportAssignments), () => {
        it("should get from file", () => {
            const { sourceFile } = getInfoFromText("export = 5; export = 6;");
            expect(sourceFile.getExportAssignments().length).to.equal(2);
            expect(sourceFile.getExportAssignments()[0]).to.be.instanceOf(ExportAssignment);
        });

        it("should get from namespace", () => {
            const { sourceFile } = getInfoFromText("namespace T { export = 5; export = 6; }");
            const result = sourceFile.getNamespaces()[0].getExportAssignments();
            expect(result.length).to.equal(2);
            expect(result[0]).to.be.instanceOf(ExportAssignment);
        });
    });

    describe(nameof<ModuledNode>(n => n.getExportAssignment), () => {
        it("should get the export declaration", () => {
            const { sourceFile } = getInfoFromText("export = 5; export default 6;");
            expect(sourceFile.getExportAssignment(e => !e.isExportEquals())!.getText()).to.equal("export default 6;");
        });
    });

    describe(nameof<ModuledNode>(n => n.getExportAssignmentOrThrow), () => {
        it("should get the export declaration", () => {
            const { sourceFile } = getInfoFromText("export = 5; export default 6;");
            expect(sourceFile.getExportAssignmentOrThrow(e => !e.isExportEquals()).getText()).to.equal("export default 6;");
        });

        it("should throw when not exists", () => {
            const { sourceFile } = getInfoFromText("");
            expect(() => sourceFile.getExportAssignmentOrThrow(e => false)).to.throw();
        });
    });

    describe(nameof<ModuledNode>(n => n.getExportedDeclarations), () => {
        function assertMapsEqual(expected: [string, string[]][], actual: ReadonlyMap<string, ExportedDeclarations[]>) {
            expect(sort(Array.from(actual.entries()).map(entry => [entry[0], entry[1].map(n => n.getText())] as [string, string[]])))
                .to.deep.equal(sort(expected));

            function sort(values: [string, string[]][]) {
                values.sort((a, b) => a > b ? 1 : -1);
                return values;
            }
        }

        it("should get from a file", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile(
                "main.ts",
                `export * from "./class";\nexport {OtherClass} from "./otherClass";\nexport * from "./barrel";\n`
                    + "export class MainFileClass {}\nexport default MainFileClass;"
            );
            project.createSourceFile("class.ts", `export class Class {} export class MyClass {}`);
            project.createSourceFile("otherClass.ts", `export class OtherClass {}\nexport class InnerClass {}`);
            project.createSourceFile("barrel.ts", `export * from "./subBarrel";`);
            project.createSourceFile(
                "subBarrel.ts",
                `export * from "./subFile";\nexport {SubClass2 as Test} from "./subFile2";\n`
                    + `export {default as SubClass3} from "./subFile3"`
            );
            project.createSourceFile("subFile.ts", `export class SubClass {}`);
            project.createSourceFile("subFile2.ts", `export class SubClass2 {}`);
            project.createSourceFile("subFile3.ts", `class SubClass3 {}\nexport default SubClass3;`);

            assertMapsEqual([
                ["MainFileClass", ["export class MainFileClass {}"]],
                ["default", ["export class MainFileClass {}"]],
                ["OtherClass", ["export class OtherClass {}"]],
                ["Class", ["export class Class {}"]],
                ["MyClass", ["export class MyClass {}"]],
                ["SubClass", ["export class SubClass {}"]],
                ["Test", ["export class SubClass2 {}"]],
                ["SubClass3", ["class SubClass3 {}"]]
            ], mainSourceFile.getExportedDeclarations());
        });

        it("should get the original declaration of one that's imported then exported", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import { Test } from "./Test"; export { Test };`);
            project.createSourceFile("Test.ts", `export class Test {}`);

            assertMapsEqual([
                ["Test", ["export class Test {}"]]
            ], mainSourceFile.getExportedDeclarations());
        });

        it("should get the original declaration of one that's imported on a different name then exported", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import { Test as NewTest } from "./Test"; export { NewTest };`);
            project.createSourceFile("Test.ts", `export class Test {}`);

            assertMapsEqual([
                ["NewTest", ["export class Test {}"]]
            ], mainSourceFile.getExportedDeclarations());
        });

        it("should get the namespace import identifier of one that's exported from an imported namespace export that doesn't import a namespace", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import * as ts from "./Test"; export { ts };`);
            project.createSourceFile("Test.ts", `export class Test {}`);

            assertMapsEqual([
                ["ts", ["export class Test {}"]]
            ], mainSourceFile.getExportedDeclarations());
        });

        it("should get the namespace import identifier of one that's exported from an imported namespace export that imports a namespace declaration", () => {
            // perhaps in the future this should return the namespace declarations
            const project = new Project({ useInMemoryFileSystem: true });
            const fileSystem = project.getFileSystem();
            fileSystem.writeFileSync("/node_modules/@types/typescript/index.d.ts", `
declare namespace ts { const version: string; }
declare namespace ts { const version2: string; }
export = ts;`);
            const mainSourceFile = project.createSourceFile("main.ts", `import * as ts from "typescript"; export { ts };`);

            assertMapsEqual([
                ["ts", [
                    "declare namespace ts { const version: string; }",
                    "declare namespace ts { const version2: string; }"
                ]]
            ], mainSourceFile.getExportedDeclarations());
        });

        it("should get the original declaration of one that's imported on a default import then exported", () => {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", `import Test from "./Test"; export { Test };`);
            project.createSourceFile("Test.ts", `export default class Test {}`);

            assertMapsEqual([
                ["Test", ["export default class Test {}"]]
            ], mainSourceFile.getExportedDeclarations());
        });

        function doTest(text: string, expected: [string, string[]][]) {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("main.ts", text);

            assertMapsEqual(expected, mainSourceFile.getExportedDeclarations());
        }

        it("should get when there's only a default export using an export assignment", () => {
            doTest("class MainFileClass {}\nexport default MainFileClass;", [
                ["default", ["class MainFileClass {}"]]
            ]);
        });

        it("should get when the same declaration is exported twice as a named export and default export", () => {
            doTest("export class MainFileClass {}\nexport default MainFileClass;", [
                ["MainFileClass", ["export class MainFileClass {}"]],
                ["default", ["export class MainFileClass {}"]]
            ]);
        });

        it("should get when exporting a string literal as a default export", () => {
            doTest("export default 'test';", [
                ["default", ["'test'"]]
            ]);
        });

        it("should get when exporting a numeric literal as a default export", () => {
            doTest("export default 5;", [
                ["default", ["5"]]
            ]);
        });

        it("should get when exporting an object literal expression", () => {
            doTest("export default {};", [
                ["default", ["{}"]]
            ]);
        });

        it("should get when there's an interface and function with the same name", () => {
            doTest("export interface MyItem {}\nexport function MyItem() {}", [
                ["MyItem", ["export function MyItem() {}", "export interface MyItem {}"]]
            ]);
        });

        it("should not error for an empty file", () => {
            doTest("", []);
        });

        function doNamespaceTest(text: string, expected: [string, string[]][]) {
            const project = new Project({ useInMemoryFileSystem: true });
            const mainSourceFile = project.createSourceFile("file.d.ts", text);

            assertMapsEqual(expected, mainSourceFile.getNamespaces()[0].getExportedDeclarations());
        }

        it("should get from namespace when there's a default export using an export assignment", () => {
            doNamespaceTest("declare module 'test' { class Test {} export default Test; }", [
                ["default", ["class Test {}"]]
            ]);
        });

        it("should not error for an empty namespace", () => {
            doNamespaceTest("namespace Test {}", []);
        });

        it("should not error for an empty ambient module", () => {
            doNamespaceTest("declare module 'test' {}", []);
        });
    });

    describe(nameof<ModuledNode>(n => n.getDefaultExportSymbol), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            const defaultSymbol = sourceFile.getDefaultExportSymbol();
            expect(defaultSymbol?.getName()).to.equal(expectedName);
        }

        it("should return undefined when there's no default export", () => {
            doTest("", undefined);
        });

        it("should return the default export symbol when one exists", () => {
            doTest("export default class Identifier {}", "default");
        });

        it("should return the default export symbol when default exported on a separate statement", () => {
            doTest("class Identifier {}\nexport default Identifier;", "default");
        });

        it("should return the default export symbol for a module", () => {
            doTest("class Identifier {}\nexport default Identifier;", "default");
            const { sourceFile } = getInfoFromText("declare module 'test' { class Identifier {}\nexport default Identifier; }", { isDefinitionFile: true });
            const defaultSymbol = sourceFile.getNamespaces()[0].getDefaultExportSymbol();
            expect(defaultSymbol!.getName()).to.equal("default");
        });
    });

    describe(nameof<ModuledNode>(n => n.getDefaultExportSymbolOrThrow), () => {
        function doTest(text: string, expectedName: string | undefined) {
            const { sourceFile } = getInfoFromText(text);
            if (expectedName == null)
                expect(() => sourceFile.getDefaultExportSymbolOrThrow()).to.throw();
            else
                expect(sourceFile.getDefaultExportSymbolOrThrow().getName()).to.equal(expectedName);
        }

        it("should throw when there's no default export", () => {
            doTest("", undefined);
        });

        it("should return the default export symbol when one exists", () => {
            doTest("export default class Identifier {}", "default");
        });
    });

    describe(nameof<SourceFile>(n => n.removeDefaultExport), () => {
        function doTest(text: string, expected: string) {
            const { sourceFile } = getInfoFromText(text);
            sourceFile.removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should do nothing when there's no default export", () => {
            doTest("", "");
        });

        it("should remove the default export symbol when one exists", () => {
            doTest("export default class Identifier {}", "class Identifier {}");
        });

        it("should remove the default export symbol when default exported on a separate statement", () => {
            doTest("namespace Identifier {}\nclass Identifier {}\nexport default Identifier;\n", "namespace Identifier {}\nclass Identifier {}\n");
        });

        function doNamespaceTest(text: string, expected: string) {
            const { sourceFile } = getInfoFromText(text, { isDefinitionFile: true });
            sourceFile.getNamespaces()[0].removeDefaultExport();
            expect(sourceFile.getFullText()).to.equal(expected);
        }

        it("should remove the default export symbol from an ambient module", () => {
            doNamespaceTest("declare module 'test' {\n    namespace Identifier {}\n    class Identifier {}\n    export default Identifier;\n}",
                "declare module 'test' {\n    namespace Identifier {}\n    class Identifier {}\n}");
        });
    });
});
